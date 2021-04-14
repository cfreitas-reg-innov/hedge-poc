// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.3;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./DaiToken.sol";

contract LiquidityPoolDAI is Ownable, ERC20("Hegic DAI LP Token", "writeDAI"){

    //IERC20 public override token;
    DaiToken token;
    mapping(address => uint256) private lastProvideTimestamp;
    using SafeMath for uint256;
    uint256 public lockupPeriod = 2 weeks;
    uint256 public lockedAmount;
    uint256 public lockedPremium;

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
        return token.balanceOf(address(this)).sub(lockedPremium);
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
     * @nonce Calls by HegicPutOptions to unlock premium after an option expiraton
     * @param amount Amount of premiums that should be locked
     */
    function unlockPremium(uint256 amount) external {
        require(lockedPremium >= amount, "Pool Error: You are trying to unlock more premiums than have been locked for the contract. Please lower the amount.");
        lockedPremium = lockedPremium.sub(amount);
    }

    /*
     * @nonce Calls by HegicPutOptions to unlock funds
     * @param amount Amount of funds that should be unlocked in an expired option
     */
    function unlock(uint256 amount) external{
        require(lockedAmount >= amount, "Pool Error: You are trying to unlock more funds than have been locked for your contract. Please lower the amount.");
        lockedAmount = lockedAmount.sub(amount);
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
        lockedPremium = lockedPremium.add(amount);
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer error: Please lower the amount of premiums that you want to send."
        );
    }

    /*
     * @nonce calls by HegicPutOptions to unlock the premiums after an option's expiraton
     * @param to Provider
     * @param amount Amount of premiums that should be unlocked
     */
    function send(address payable to, uint256 amount)
        external
        onlyOwner
    {
        require(to != address(0));
        //require(lockedAmount >= amount, "Pool Error: You are trying to unlock more premiums than have been locked for the contract. Please lower the amount.");
        require(token.transfer(to, amount), "Token transfer error: Please lower the amount of premiums that you want to send.");
    }

    /*
     * @nonce calls by HegicPutOptions to lock funds
     * @param amount Amount of funds that should be locked in an option
     */
    function lock(uint256 amount) external onlyOwner {
        /*
        require(
            lockedAmount.add(amount).mul(10).div(totalBalance()) < 8,
            "Pool Error: Not enough funds on the pool contract. Please lower the amount."
        );*/
        lockedAmount = lockedAmount.add(amount);
    }



}
