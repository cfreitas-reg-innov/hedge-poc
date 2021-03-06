// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.3;

contract DaiToken {
    string  public name = "Mock DAI Token";
    string  public symbol = "mDAI";
    uint256 public totalSupply = 10000000000000000000000000; // 10 million tokens
    uint8   public decimals = 18;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf; // Fetch the value of mapping, associative array / hash array / key value
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    // mimics minting as if it was a real token (ERC20)
    // next steps: transform DaiToken into ERC20 and use real mint method
    function mint(address account, uint256 amount) public returns (bool success){
        totalSupply -= amount;
        balanceOf[account] += amount;
        //emit Transfer(msg.sender, account, amount);
        return true;
    }

}
