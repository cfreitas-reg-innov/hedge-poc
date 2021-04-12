// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.3;

import "./DaiToken.sol";
import "./LiquidityPoolDAI.sol";
import "./Options.sol";
import "./FakeComponents.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract PutSimple is Ownable{

    using SafeMath for uint256;

    string public name = "Put Hedge Option Contract";
    DaiToken token;
    uint256 public maxSpread = 95;
    FakeSwap public fakeSwap; //update to real swap
    FakePriceProvider public fakePriceProvider;
    LiquidityPoolDAI public pool;

    receive() external payable {}

    constructor(DaiToken _token,
                FakePriceProvider _fakePriceProvider, // update to real price provider
                FakeSwap _fakeSwap) // update to real swap
                {
        token = _token;
        pool = new LiquidityPoolDAI(token);
        fakeSwap = _fakeSwap;
        fakePriceProvider = _fakePriceProvider;
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
    function sendPremium(uint256 amount) external returns (uint premium) {
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
}
