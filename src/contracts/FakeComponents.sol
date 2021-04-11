// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.3;

import "./DaiToken.sol";

contract FakeSwap{

    DaiToken token;
    FakePriceProvider price;

    uint256 public spread = 99;
    address public WETH = address(this);


    constructor(FakePriceProvider _fpp, DaiToken _daitoken){
        token = _daitoken;
        price = _fpp;
    }

    receive() external payable {}
    
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256
    ) external payable returns (uint256 amount) {
        require(path[0] == WETH, "UniswapV2Router: INVALID_PATH");
        amount = getEthToTokenInputPrice(msg.value);
        require(amount >= amountOutMin, "Spread is too high");
        require(token.mint(to, amount));
        /*
        amounts = new uint256[](path.length);
        amounts[0] = msg.value;
        amounts[path.length - 1] = amount;
        */
    }

    function getEthToTokenInputPrice(uint256 eth_sold)
        public
        view
        returns (uint256 tokens_bought)
    {
        tokens_bought =
            (eth_sold * uint256(price.latestAnswer()) * spread) /
            1e10;
    }

}

contract FakePriceProvider {
    uint256 public price;

    constructor(uint256 p) {
        price = p;
    }

    function latestAnswer() external view returns (uint256) {
        return price;
    }

    function setPrice(uint256 _price) public {
        price = _price;
    }
}

