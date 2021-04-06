// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.3;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./DaiToken.sol";

contract LiquidityPool is Ownable, ERC20("Hegic DAI LP Token", "writeDAI"){

    //IERC20 public override token;
    DaiToken token;
    mapping(address => uint256) private lastProvideTimestamp;
    using SafeMath for uint256;

    event Provide(address indexed account, uint256 amount, uint256 writeAmount);
    event Withdraw(address indexed account, uint256 amount, uint256 writeAmount);

    constructor(DaiToken _daiToken) {
        token = _daiToken;
    }

    function provide (uint256 amount) public returns (uint256 mint){
        lastProvideTimestamp[msg.sender] = block.timestamp;

        uint supply = totalSupply();
        uint balance = totalBalance();

        if (supply > 0 && balance > 0)
            mint = amount.mul(supply).div(balance);
        else
            mint = amount.mul(1000);
        
        _mint(msg.sender, mint);
        emit Provide(msg.sender, amount, mint);
        
        require(token.transferFrom(msg.sender, address(this), amount));

    }
        
    /*
     * @nonce Returns the DAI total balance provided to the pool
     * @return balance Pool balance
     */
    function totalBalance() public view returns (uint256 balance) {
        return token.balanceOf(address(this));
    }
    

    /*
     * @nonce Returns provider's share in DAI
     * @param account Provider's address
     * @return Provider's share in DAI
     */
    function shareOf(address user) external view returns (uint256 share) {
        uint supply = totalSupply();
        if (supply > 0)
            share = totalBalance().mul(balanceOf(user)).div(supply);
        else
            share = 0;
    }


    /*
     * @nonce Provider burns writeDAI and receives DAI from the pool
     * @param amount Amount of DAI to receive
     * @param maxBurn Maximum amount of tokens that can be burned
     * @return mint Amount of tokens to be burnt
     */
    function withdraw(uint256 amount) external returns (uint256 burn) {
        /*
        require(
            lastProvideTimestamp[msg.sender].add(lockupPeriod) <= now,
            "Pool: Withdrawal is locked up"
        );
        require(
            amount <= availableBalance(),
            "Pool Error: You are trying to unlock more funds than have been locked for your contract. Please lower the amount."
        );*/
        burn = amount.mul(totalSupply()).div(totalBalance());

        //require(burn <= maxBurn, "Pool: Burn limit is too small");
        require(burn <= balanceOf(msg.sender), "Pool: Amount is too large");
        require(burn > 0, "Pool: Amount is too small");

        _burn(msg.sender, burn);
        emit Withdraw(msg.sender, amount, burn);
        require(token.transfer(msg.sender, amount), "Insufficient funds");
    }
    
    /*
     * @nonce Calls by HegicPutOptions to send and lock the premiums
     * @param amount Funds that should be locked
     */
    function sendPremium(uint256 amount) external onlyOwner {
        //lockedPremium = lockedPremium.add(amount);
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer error: Please lower the amount of premiums that you want to send."
        );
    }


}
