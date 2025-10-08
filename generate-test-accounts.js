const TronWeb = require('tronweb');

// Initialize TronWeb for Shasta Testnet
const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io'
});

async function generateTestAccounts() {
  console.log('🔗 Generating Tron Testnet Accounts...\n');
  
  // Generate 3 test accounts
  for (let i = 1; i <= 3; i++) {
    const account = tronWeb.utils.accounts.generateAccount();
    
    console.log(`👤 User ${i}:`);
    console.log(`   Binance ID: user${i}`);
    console.log(`   Tron Address: ${account.address.base58}`);
    console.log(`   Private Key: ${account.privateKey}`);
    console.log(`   Public Key: ${account.publicKey}`);
    console.log('');
  }
  
  console.log('📋 Next Steps:');
  console.log('1. Get test TRX from: https://www.trongrid.io/faucet');
  console.log('2. Use these addresses in your .env file');
  console.log('3. Deploy the smart contract to Shasta Testnet');
  console.log('4. Update CONTRACT_ADDRESS in .env');
}

generateTestAccounts().catch(console.error);






