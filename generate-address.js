const TronWeb = require('tronweb');

// Initialize TronWeb for Shasta Testnet
const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io'
});

function generateNewAddress() {
  console.log('🔗 Generating New Tron Testnet Address...\n');
  
  const account = tronWeb.utils.accounts.generateAccount();
  
  console.log('👤 New Test Account:');
  console.log(`   Tron Address: ${account.address.base58}`);
  console.log(`   Private Key: ${account.privateKey}`);
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Import this address into TronLink');
  console.log('2. Get test TRX from faucet');
  console.log('3. Use this address for testing');
}

generateNewAddress();






