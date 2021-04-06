// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.3;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract WriteDaiToken is ERC20("Hegic DAI LP Token", "writeDAI") {
    
    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }

}
