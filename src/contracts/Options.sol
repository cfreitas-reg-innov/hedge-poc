// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.3;

import "./LiquidityPoolDAI.sol";
import "./LiquidityPoolETH.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FakeComponents.sol";

abstract
contract Options is Ownable{
    using SafeMath for uint256;
    OptionType private optionType;
    FakePriceProvider fakePriceProvider;
    Option[] public options;

    address payable public settlementFeeRecipient;
    uint256 public impliedVolRate;
    uint256 internal constant PRICE_DECIMALS = 1e8;
    uint256 internal contractCreationTimestamp;

    event Create(
        uint256 indexed id,
        address indexed account,
        uint256 settlementFee,
        uint256 totalFee
    );

    enum State {Active, Exercised, Expired} 
    enum OptionType {Put, Call}

    constructor(OptionType _type, FakePriceProvider _fakePriceProvider) {
        optionType = _type;
        fakePriceProvider = _fakePriceProvider;
    }

    struct Option {
        State state;
        address payable holder;
        uint256 strike;
        uint256 amount;
        uint256 premium;
        uint256 expiration;
    }

    function payProfit(Option memory option)
        internal
        virtual
        returns (uint256 amount);


    /**
     * @notice Creates a new option
     * @param period Option period in seconds (1 days <= period <= 4 weeks)
     * @param amount Option amount
     * @param strike Strike price of the option
     * @return optionID Created option's ID
     */
    function create(
        uint256 period,
        uint256 amount,
        uint256 strike
    ) external payable returns (uint256 optionID) {
        
        (uint256 total, uint256 settlementFee, , ) = fees(
            period,
            amount,
            strike
        );
        uint256 strikeAmount = strike.mul(amount) / PRICE_DECIMALS;

        require(strikeAmount > 0, "Amount is too small");
        require(settlementFee < total, "Premium is too small");
        require(period >= 1 days, "Period is too short");
        require(period <= 4 weeks, "Period is too long");
        require(msg.value == total, "Wrong value");
    
        uint256 premium = sendPremium(total.sub(settlementFee));
        optionID = options.length;
        options.push(
            Option(
                State.Active,
                payable(msg.sender),
                strike,
                amount,
                premium,
                block.timestamp + period
            )
        );

        emit Create(optionID, msg.sender, settlementFee, total);
        lockFunds(options[optionID]);
        settlementFeeRecipient.transfer(settlementFee);
    }

    function sendPremium(uint256 amount)
        internal
        virtual
        returns (uint256 locked);

    /**
     * @notice Used for getting the actual options prices
     * @param period Option period in seconds (1 days <= period <= 4 weeks)
     * @param amount Option amount
     * @param strike Strike price of the option
     * @return total Total price to be paid
     * @return settlementFee Amount to be distributed to the HEGIC token holders
     * @return strikeFee Amount that covers the price difference in the ITM options
     * @return periodFee Option period fee amount
     */
    function fees(
        uint256 period,
        uint256 amount,
        uint256 strike
    )
        public
        view
        returns (
            uint256 total,
            uint256 settlementFee,
            uint256 strikeFee,
            uint256 periodFee
        )
    {
        uint256 currentPrice = uint256(fakePriceProvider.latestAnswer());
        settlementFee = getSettlementFee(amount);
        periodFee = getPeriodFee(amount, period, strike, currentPrice);
        strikeFee = getStrikeFee(amount, strike, currentPrice);
        total = periodFee.add(strikeFee);
    }

        /**
     * @notice Calculates settlementFee
     * @param amount Option amount
     * @return fee Settlement fee amount
     */
    function getSettlementFee(uint256 amount)
        internal
        pure
        returns (uint256 fee)
    {
        return amount / 100;
    }

    /**
     * @notice Calculates periodFee
     * @param amount Option amount
     * @param period Option period in seconds (1 days <= period <= 4 weeks)
     * @param strike Strike price of the option
     * @param currentPrice Current price of ETH
     * @return fee Period fee amount
     *
     * amount < 1e30        |
     * impliedVolRate < 1e10| => amount * impliedVolRate * strike < 1e60 < 2^uint256
     * strike < 1e20 ($1T)  |
     *
     * in case amount * impliedVolRate * strike >= 2^256
     * transaction will be reverted by the SafeMath
     */
    function getPeriodFee(
        uint256 amount,
        uint256 period,
        uint256 strike,
        uint256 currentPrice
    ) internal view returns (uint256 fee) {
        if (optionType == OptionType.Put)
            return amount
                .mul(sqrt(period))
                .mul(impliedVolRate)
                .mul(strike)
                .div(currentPrice)
                .div(PRICE_DECIMALS);
        else
            return amount
                .mul(sqrt(period))
                .mul(impliedVolRate)
                .mul(currentPrice)
                .div(strike)
                .div(PRICE_DECIMALS);
    }

    /**
     * @notice Calculates strikeFee
     * @param amount Option amount
     * @param strike Strike price of the option
     * @param currentPrice Current price of ETH
     * @return fee Strike fee amount
     */
    function getStrikeFee(
        uint256 amount,
        uint256 strike,
        uint256 currentPrice
    ) internal view returns (uint256 fee) {
        if (strike > currentPrice && optionType == OptionType.Put)
            return strike.sub(currentPrice).mul(amount).div(currentPrice);
        if (strike < currentPrice && optionType == OptionType.Call)
            return currentPrice.sub(strike).mul(amount).div(currentPrice);
        return 0;
    }

    function lockFunds(Option memory option) internal virtual;
    function unlockFunds(Option memory option) internal virtual;

    /**
     * @return result Square root of the number
     */
    function sqrt(uint256 x) private pure returns (uint256 result) {
        result = x;
        uint256 k = x.add(1).div(2);
        while (k < result) (result, k) = (k, x.div(k).add(k).div(2));
    }
}