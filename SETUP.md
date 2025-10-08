# Setup Guide - TRC20 Demo Project

This guide will walk you through setting up the TRC20 Demo project step by step.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)
- **TronLink Wallet** - [Install here](https://www.tronlink.org/)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd trc20-transfer-demo

# Install dependencies
npm install
```

## Step 2: Database Setup

### Install MongoDB

**Windows:**
1. Download MongoDB Community Server
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB Compass (optional GUI)

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### Start MongoDB

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or start manually
mongod --dbpath C:\data\db
```

**macOS:**
```bash
# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

**Linux:**
```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Step 3: Tron Wallet Setup

### Create TronLink Wallet

1. Install TronLink browser extension
2. Create a new wallet
3. Save your seed phrase securely
4. Switch to **Shasta Testnet**:
   - Click on network dropdown
   - Select "Shasta Testnet"
   - Add custom RPC if needed: `https://api.shasta.trongrid.io`

### Get Test TRX

1. Visit [Tron Shasta Faucet](https://www.trongrid.io/faucet)
2. Enter your Tron address
3. Request test TRX (you'll need this for gas fees)

### Get Your Wallet Details

1. Open TronLink
2. Click on your address to copy it
3. Export your private key (Settings > Export Private Key)
4. Save both address and private key securely

## Step 4: Smart Contract Deployment

### Option A: Using TronIDE (Recommended)

1. Go to [TronIDE](https://www.tronide.io/)
2. Switch to Shasta Testnet
3. Create a new file called `TRC20Token.sol`
4. Copy the contract code from `contracts/TRC20Token.sol`
5. Compile the contract
6. Deploy using your TronLink wallet
7. Copy the contract address

### Option B: Using TronLink

1. Go to [TronScan](https://shasta.tronscan.org/)
2. Connect your wallet
3. Go to "Contract" > "Deploy Contract"
4. Paste the contract code
5. Deploy and get the contract address

## Step 5: Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your details:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/trc20_demo

   # Tron Network Configuration
   TRON_NETWORK=shasta
   TRON_PRIVATE_KEY=your_private_key_from_tronlink
   CONTRACT_ADDRESS=your_deployed_contract_address

   # Email Configuration (Optional - for notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

### Email Setup (Optional)

For email notifications, set up Gmail App Password:

1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account settings
3. Security > App passwords
4. Generate a new app password
5. Use this password in `EMAIL_PASS`

## Step 6: Run the Application

### Development Mode

```bash
# Start the server
npm run dev

# In another terminal, start the frontend
npm run dev-frontend
```

### Production Mode

```bash
# Build the frontend
npm run build

# Start the server
npm start
```

## Step 7: Test the Application

1. Open your browser to `http://localhost:3000`
2. Register a test user:
   - Binance ID: `testuser1`
   - Tron Address: Your Tron address
   - Email: Your email
3. Register another test user:
   - Binance ID: `testuser2`
   - Tron Address: A different Tron address
   - Email: Another email
4. Try transferring tokens between users
5. Check notifications and transfer history

## Step 8: Verify Everything Works

### Check Database
```bash
# Connect to MongoDB
mongo
use trc20_demo
db.users.find()
db.transfers.find()
db.notifications.find()
```

### Check Smart Contract
1. Go to [TronScan Shasta](https://shasta.tronscan.org/)
2. Search for your contract address
3. Verify it's deployed and active

### Check Logs
Monitor the console for any errors:
```bash
# Server logs
npm run dev

# Check for errors in browser console
# Open Developer Tools > Console
```

## Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service

**2. Tron Contract Error**
```
Error: Contract not found
```
**Solution:** Verify contract address and network

**3. Insufficient TRX Error**
```
Error: Insufficient balance
```
**Solution:** Get more test TRX from faucet

**4. Email Error**
```
Error: Invalid login
```
**Solution:** Check email credentials and app password

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=*
```

### Reset Database

To start fresh:
```bash
# Connect to MongoDB
mongo
use trc20_demo
db.dropDatabase()
```

## Next Steps

Once everything is working:

1. **Customize the UI** - Modify `src/frontend/index.html` and `index.js`
2. **Add Features** - Extend the smart contract or API
3. **Deploy to Production** - Use services like Heroku, AWS, or DigitalOcean
4. **Add Tests** - Write unit and integration tests
5. **Security Audit** - Review code for security vulnerabilities

## Support

If you encounter issues:

1. Check this setup guide
2. Review the main README.md
3. Check the troubleshooting section
4. Create an issue in the repository

## Additional Resources

- [Tron Documentation](https://developers.tron.network/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Socket.io Documentation](https://socket.io/docs/)






