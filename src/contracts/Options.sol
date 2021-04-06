// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.3;

import "./LiquidityPool.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract
contract Options is Ownable{
    using SafeMath for uint256;
    OptionType private optionType;

    event Create(address indexed account, uint256 settlementFee, uint256 totalFee);

    enum OptionType {Put, Call}

    constructor(OptionType _type) {
        optionType = _type;
    }

    struct Option {
        //State state;
        address payable holder;
        uint256 strike;
        uint256 amount;
        uint256 premium;
        uint256 expiration;
    }

    function sendPremium(uint256 amount)
        internal
        virtual
        returns (uint256 locked);


}