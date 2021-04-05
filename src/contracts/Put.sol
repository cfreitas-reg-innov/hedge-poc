// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.5.0;

import "./DaiToken.sol";

contract Put{

    string public name = "Put Hedge Option Contract";
    address public owner;
    uint256 public strike;
    uint256 public amount;
    uint256 public premium;
    string public period;
    DaiToken public daiToken;

    constructor(string memory _period, uint256 _amount, uint256 _strike, uint256 _premium, DaiToken _daiToken) public{
        owner = msg.sender;
        strike = _strike;
        amount = _amount;
        premium = _premium;
        period = _period;
        daiToken = _daiToken;
    }

    function transferPremium(address _to) public {
        daiToken.transferFrom(msg.sender, _to, premium);
    }


}