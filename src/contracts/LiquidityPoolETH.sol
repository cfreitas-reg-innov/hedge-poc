// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.3;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./DaiToken.sol";

contract LiquidityPoolETH is Ownable, ERC20("ETH LP Token", "writeETH"){

    using SafeMath for uint256;

    uint256 public lockedPremium;

    event Provide(address indexed account, uint256 amount, uint256 writeAmount);

    /*
     * @nonce Sends premiums to the liquidity pool
     **/
    receive() external payable {}

        /*
     * @nonce A provider supplies ETH to the pool and receives writeETH tokens
     * @param minMint Minimum amount of tokens that should be received by a provider.
                      Calling the provide function will require the minimum amount of tokens to be minted.
                      The actual amount that will be minted could vary but can only be higher (not lower) than the minimum value.
     * @return mint Amount of tokens to be received
     */
    function provide(uint256 minMint) external payable returns (uint256 mint) {
        //lastProvideTimestamp[msg.sender] = now;
        uint supply = totalSupply();
        uint balance = totalBalance();
        if (supply > 0 && balance > 0)
            mint = msg.value.mul(supply).div(balance.sub(msg.value));
        else
            mint = msg.value.mul(1000);

        require(mint >= minMint, "Pool: Mint limit is too large");
        require(mint > 0, "Pool: Amount is too small");

        _mint(msg.sender, mint);
        emit Provide(msg.sender, msg.value, mint);
    }

    /*
     * @nonce Returns the total balance of ETH provided to the pool
     * @return balance Pool balance
     */
    function totalBalance() public returns (uint256 balance) {
        return address(this).balance.sub(lockedPremium);
    }

        /*
     * @nonce calls by HegicPutOptions to lock the premiums
     * @param amount Amount of premiums that should be locked
     */
    function sendPremium() external payable onlyOwner {
        lockedPremium = lockedPremium.add(msg.value);
    }
}
