// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TRC20Token {
    string public name = "Demo USDT";
    string public symbol = "DUSDT";
    uint8 public decimals = 6;
    uint256 public totalSupply = 1000000 * 10**decimals; // 1 million tokens
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    address public owner;
    mapping(address => bool) public isBinanceUser;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event BinanceUserAdded(address indexed user, string binanceId);
    event NotificationSent(address indexed from, address indexed to, uint256 value, string message);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function addBinanceUser(address user, string memory binanceId) public onlyOwner {
        isBinanceUser[user] = true;
        emit BinanceUserAdded(user, binanceId);
    }
    
    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        require(to != address(0), "Invalid recipient address");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        emit Transfer(msg.sender, to, value);
        
        // Send notification event
        string memory message = string(abi.encodePacked(
            "Transfer of ", 
            uint2str(value / 10**decimals), 
            " DUSDT completed"
        ));
        emit NotificationSent(msg.sender, to, value, message);
        
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        require(to != address(0), "Invalid recipient address");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        
        // Send notification event
        string memory message = string(abi.encodePacked(
            "Transfer of ", 
            uint2str(value / 10**decimals), 
            " DUSDT completed"
        ));
        emit NotificationSent(from, to, value, message);
        
        return true;
    }
    
    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function mint(address to, uint256 value) public onlyOwner {
        require(to != address(0), "Invalid recipient address");
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }
    
    function burn(uint256 value) public {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        totalSupply -= value;
        emit Transfer(msg.sender, address(0), value);
    }
    
    function getBalance(address account) public view returns (uint256) {
        return balanceOf[account];
    }
    
    function isBinanceUserCheck(address user) public view returns (bool) {
        return isBinanceUser[user];
    }
    
    // Helper function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}






