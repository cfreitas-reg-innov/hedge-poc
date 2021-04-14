// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.3;

import "./DaiToken.sol";
import "./LiquidityPoolDAI.sol";
import "./Options.sol";
import "./FakeComponents.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Put is Options{

    using SafeMath for uint256;

    string public name = "Put Hedge Option Contract";
    DaiToken token;
    LiquidityPoolDAI public pool;
    uint256 public maxSpread = 95;
    FakeSwap public fakeSwap; //update to real swap

    constructor(DaiToken _token, 
                FakePriceProvider _fakePriceProvider, // update to real price provider
                FakeSwap _fakeSwap) // update to real swap
                Options(Options.OptionType.Put, _fakePriceProvider) {

        token = _token;
        fakeSwap = _fakeSwap;
        pool = new LiquidityPoolDAI(token);
        approve();
    }

    /**
     * @notice Allows the ERC pool contract to receive and send tokens
     */
    function approve() public {
        require(token.approve(address(pool), uint256(10000000000000000000000000)), "token approve failed");
    }

    /**
     * @notice Sends premiums to the ERC liquidity pool contract
     */
    function sendPremium(uint256 amount) internal override returns (uint premium) {
        uint currentPrice = uint(fakePriceProvider.latestAnswer());
        address[] memory path = new address[](2);
        path[0] = fakeSwap.WETH();
        path[1] = address(token);
        uint[] memory amounts = fakeSwap.swapExactETHForTokens {
            value: amount
        }(
            amount.mul(currentPrice).mul(maxSpread).div(1e10),
            path,
            address(this),
            block.timestamp
        );
        premium = amounts[amounts.length - 1];
        pool.sendPremium(premium);
    }

    /**
     * @notice Sends profits in DAI from the ERC pool to a put option holder's address
     * @param option A specific option contract
     */
    function payProfit(Option memory option) internal override returns (uint profit) {
        //uint currentPrice = uint(priceProvider.latestAnswer());
        //require(option.strike >= currentPrice, "Current price is too high");
        //profit = option.strike.sub(currentPrice).mul(option.amount).div(PRICE_DECIMALS);
        profit = uint256(10000000000000000000);
        pool.send(option.holder, profit);
        //unlockFunds(option);
    }

    /**
     * @notice Unlocks the amount that was locked in a put option contract
     * @param option A specific option contract
     */
    function unlockFunds(Option memory option) internal override {
        pool.unlockPremium(option.premium);
        //pool.unlock(option.amount.mul(option.strike).div(PRICE_DECIMALS));
    }

    /**
     * @notice Locks the amount required for an option
     * @param option A specific option contract
     */
    function lockFunds(Option memory option) internal override {
        pool.lock(fakeSwap.getEthToTokenInputPrice(option.amount)); // locks the total amount in DAI for the total of the contract
        //pool.lock(option.amount.mul(option.strike).div(PRICE_DECIMALS));
    }

    

}