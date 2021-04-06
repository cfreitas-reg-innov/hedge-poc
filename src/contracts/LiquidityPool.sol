// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.3;
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

import "./DaiToken.sol";
import "./WriteDaiToken.sol";

contract LiquidityPool is ERC20("Hegic DAI LP Token", "writeDAI"){

    //IERC20 public override token;
    DaiToken token;
    WriteDaiToken wToken;
    mapping(address => uint256) private lastProvideTimestamp;
    using SafeMath for uint256;

    event Provide(address indexed account, uint256 amount, uint256 writeAmount);

    constructor(DaiToken _daiToken, WriteDaiToken _writeDaiToken) {
        token = _daiToken;
        wToken = _writeDaiToken;
    }

    function provide (uint256 amount) public returns (uint256 mint){
        lastProvideTimestamp[msg.sender] = block.timestamp;

        uint supply = totalSupply();
        uint balance = totalBalance();

        if (supply > 0 && balance > 0)
            mint = amount.mul(supply).div(balance);
        else
            mint = amount.mul(1000);
        
        //_mint(msg.sender, mint);
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
            share = totalBalance().mul(token.balanceOf(user)).div(supply);
        else
            share = 0;
    }
    

}
