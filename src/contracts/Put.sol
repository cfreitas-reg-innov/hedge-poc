// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.3;

import "./DaiToken.sol";
import "./LiquidityPool.sol";
import "./Options.sol";

contract Put is Options{

    string public name = "Put Hedge Option Contract";
    DaiToken token;
    LiquidityPool pool;

    constructor(DaiToken _token) Options(Options.OptionType.Put) {
        token = _token;
        pool = new LiquidityPool(token);
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
    function sendPremium(uint256 amount) public {
        /*
        uint currentPrice = uint(priceProvider.latestAnswer());
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = address(token);
        uint[] memory amounts = uniswapRouter.swapExactETHForTokens {
            value: amount
        }(
            amount.mul(currentPrice).mul(maxSpread).div(1e10),
            path,
            address(this),
            now
        );
        premium = amounts[amounts.length - 1];
        */
        pool.sendPremium(amount);
    }




}