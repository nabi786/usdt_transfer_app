const TronWeb = require('tronweb');

// Initialize TronWeb
const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io',
  privateKey: 'c11d680ad95dcb9913389c924a5608497e31af32b33bce2e00598f5701088b4c'
});

// Contract ABI
const contractABI = [
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}, {"internalType": "string", "name": "userBinanceId", "type": "string"}],
    "name": "registerBinanceUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const contractAddress = 'TYP2iw5G5ktPiSRK6gQ8V8jfXeM6vkzVMK';

async function testContract() {
  try {
    console.log('🔧 Testing contract interaction...');
    console.log('Contract Address:', contractAddress);
    console.log('Your Address:', tronWeb.address.fromPrivateKey('c11d680ad95dcb9913389c924a5608497e31af32b33bce2e00598f5701088b4c'));
    
    const contract = await tronWeb.contract(contractABI, contractAddress);
    console.log('✅ Contract loaded successfully');
    
    // Test 1: Register user
    console.log('\n📝 Registering user "testuser"...');
    const registerTx = await contract.registerBinanceUser('TSpNsgHivnd9Q9qbKeR3N2a2CnhPHGTGrR', 'testuser').send();
    console.log('✅ Registration transaction:', registerTx);
    
    // Test 2: Mint tokens
    console.log('\n💰 Minting 1000 DUSDT...');
    const mintAmount = 1000000000; // 1000 * 10^6 = 1000 USDT with 6 decimals
    const mintTx = await contract.mint('TSpNsgHivnd9Q9qbKeR3N2a2CnhPHGTGrR', mintAmount).send();
    console.log('✅ Minting transaction:', mintTx);
    
    // Test 3: Check balance
    console.log('\n🔍 Checking balance...');
    const balance = await contract.balanceOf('TSpNsgHivnd9Q9qbKeR3N2a2CnhPHGTGrR').call();
    const balanceInUSDT = balance / 1000000;
    console.log('✅ Contract balance:', balanceInUSDT, 'USDT');
    
    console.log('\n🎉 All tests passed! Check TronScan for transactions.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testContract();
