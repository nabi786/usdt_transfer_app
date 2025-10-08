// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DemoUSDT (DUSDT)
 * @dev A TRC20 token that mimics USDT for demonstration purposes
 * This token can be transferred between Binance IDs with zero value
 * and both sender and receiver get notifications
 */
contract DemoUSDT {
    string public name = "Demo USDT";
    string public symbol = "DUSDT";
    uint8 public decimals = 6;
    uint256 public totalSupply = 1000000000 * 10**decimals; // 1 billion tokens
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    address public owner;
    mapping(address => bool) public isBinanceUser;
    mapping(address => string) public binanceId;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event BinanceUserRegistered(address indexed user, string binanceId);
    event TransferNotification(address indexed from, address indexed to, uint256 value, string fromBinanceId, string toBinanceId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    /**
     * @dev Register a Binance user with their Tron address
     * @param user Tron address of the user
     * @param userBinanceId Binance ID of the user
     */
    function registerBinanceUser(address user, string memory userBinanceId) public onlyOwner {
        isBinanceUser[user] = true;
        binanceId[user] = userBinanceId;
        emit BinanceUserRegistered(user, userBinanceId);
    }
    
    /**
     * @dev Transfer tokens to another address
     * @param to Recipient address
     * @param value Amount to transfer
     * @return success True if transfer successful
     */
    function transfer(address to, uint256 value) public returns (bool success) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        require(to != address(0), "Invalid recipient address");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        emit Transfer(msg.sender, to, value);
        
        // Emit notification event for both sender and receiver
        string memory fromId = binanceId[msg.sender];
        string memory toId = binanceId[to];
        
        if (bytes(fromId).length > 0 && bytes(toId).length > 0) {
            emit TransferNotification(msg.sender, to, value, fromId, toId);
        }
        
        return true;
    }
    
    /**
     * @dev Transfer tokens from one address to another (with approval)
     * @param from Sender address
     * @param to Recipient address
     * @param value Amount to transfer
     * @return success True if transfer successful
     */
    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        require(to != address(0), "Invalid recipient address");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        
        // Emit notification event for both sender and receiver
        string memory fromId = binanceId[from];
        string memory toId = binanceId[to];
        
        if (bytes(fromId).length > 0 && bytes(toId).length > 0) {
            emit TransferNotification(from, to, value, fromId, toId);
        }
        
        return true;
    }
    
    /**
     * @dev Approve spender to transfer tokens on behalf of owner
     * @param spender Address to approve
     * @param value Amount to approve
     * @return success True if approval successful
     */
    function approve(address spender, uint256 value) public returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint tokens to
     * @param value Amount to mint
     */
    function mint(address to, uint256 value) public onlyOwner {
        require(to != address(0), "Invalid recipient address");
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }
    
    /**
     * @dev Burn tokens
     * @param value Amount to burn
     */
    function burn(uint256 value) public {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        totalSupply -= value;
        emit Transfer(msg.sender, address(0), value);
    }
    
    /**
     * @dev Get balance of an account
     * @param account Address to check balance for
     * @return balance Balance of the account
     */
    function getBalance(address account) public view returns (uint256 balance) {
        return balanceOf[account];
    }
    
    /**
     * @dev Check if address is registered Binance user
     * @param user Address to check
     * @return isUser True if registered Binance user
     */
    function isRegisteredBinanceUser(address user) public view returns (bool isUser) {
        return isBinanceUser[user];
    }
    
    /**
     * @dev Get Binance ID for an address
     * @param user Address to get Binance ID for
     * @return userBinanceId Binance ID of the user
     */
    function getBinanceId(address user) public view returns (string memory userBinanceId) {
        return binanceId[user];
    }
    
    /**
     * @dev Transfer with zero value (special function for demo)
     * This allows transfers even with 0 value as requested
     * @param to Recipient address
     * @return success True if transfer successful
     */
    function transferZero(address to) public returns (bool success) {
        require(to != address(0), "Invalid recipient address");
        
        // Emit transfer event with 0 value
        emit Transfer(msg.sender, to, 0);
        
        // Emit notification event for both sender and receiver
        string memory fromId = binanceId[msg.sender];
        string memory toId = binanceId[to];
        
        if (bytes(fromId).length > 0 && bytes(toId).length > 0) {
            emit TransferNotification(msg.sender, to, 0, fromId, toId);
        }
        
        return true;
    }
}






