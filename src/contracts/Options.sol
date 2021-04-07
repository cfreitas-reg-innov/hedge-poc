// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.3;

import "./LiquidityPool.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FakeComponents.sol";

abstract
contract Options is Ownable{
    using SafeMath for uint256;
    OptionType private optionType;
    FakePriceProvider fakePriceProvider;

    event Create(address indexed account, uint256 settlementFee, uint256 totalFee);

    enum OptionType {Put, Call}

    constructor(OptionType _type, FakePriceProvider _fakePriceProvider) {
        optionType = _type;
        fakePriceProvider = _fakePriceProvider;
    }

    struct Option {
        //State state;
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



}