# DUSDT Transfer System - Complete TRC20 Demo

A complete Next.js demo project for transferring **Demo USDT (DUSDT)** tokens between Binance IDs with real-time notifications. This system meets all your requirements:

✅ **TRC20 Token**: DUSDT (Demo USDT) that looks like USDT  
✅ **Binance ID Transfers**: Transfer using Binance IDs instead of wallet addresses  
✅ **Zero Value Transfers**: Can transfer 0 DUSDT as requested  
✅ **Real-time Notifications**: Both sender and receiver get instant notifications  
✅ **No Trading/Withdrawal**: Demo tokens for testing only  
✅ **Complete UI**: Modern React interface with all features  

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set up Environment
```bash
cp env.example .env
# Edit .env with your MongoDB URI
```

### Step 3: Start MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Step 4: Run the Application
```bash
npm run dev
```

### Step 5: Open Browser
Go to `http://localhost:3000`

## 📋 Complete Step-by-Step Testing

### 1. Register Users
1. Open the application
2. Go to "Register" tab
3. Register User 1:
   - Binance ID: `user1`
   - Tron Address: `TUser1Address123...`
   - Email: `user1@demo.com`
4. Register User 2:
   - Binance ID: `user2`
   - Tron Address: `TUser2Address456...`
   - Email: `user2@demo.com`

### 2. Test Transfers
1. Switch to "Transfer DUSDT" tab
2. Transfer from `user1` to `user2`:
   - From: `user1`
   - To: `user2`
   - Amount: `100` (or any amount including 0)
3. Click "Transfer DUSDT"
4. Both users will receive real-time notifications

### 3. Check Notifications
1. Switch to "Notifications" tab
2. See real-time notifications for both users
3. Notifications show transfer details and status

### 4. View Transfer History
1. Switch to "History" tab
2. Enter a Binance ID to view transfer history
3. See all incoming and outgoing transfers

### 5. Check Balances
1. Switch to "Balance" tab
2. Enter a Binance ID to check balance
3. See current DUSDT balance

## 🎯 Key Features Implemented

### ✅ TRC20 Smart Contract
- **File**: `contracts/DemoUSDT.sol`
- **Token**: DUSDT (Demo USDT)
- **Decimals**: 6 (like real USDT)
- **Features**: Transfer, transferFrom, approve, mint, burn
- **Special**: `transferZero()` function for 0-value transfers
- **Notifications**: Emits events for both sender and receiver

### ✅ Next.js Frontend
- **Framework**: Next.js 14 with App Router
- **UI**: Tailwind CSS with USDT-themed colors
- **Components**: React components for all features
- **Real-time**: Socket.io integration
- **Responsive**: Mobile-friendly design

### ✅ Backend API
- **Framework**: Next.js API routes
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io server
- **Endpoints**: Register, transfer, balance, history, notifications

### ✅ Database Models
- **User**: Binance ID, Tron address, email, balance
- **Transfer**: Complete transfer tracking
- **Notification**: Real-time notification system

## 🔧 Technical Implementation

### Smart Contract Features
```solidity
// Transfer with notifications
function transfer(address to, uint256 value) public returns (bool) {
    // Standard transfer logic
    emit Transfer(msg.sender, to, value);
    
    // Emit notification for both parties
    emit TransferNotification(msg.sender, to, value, fromId, toId);
}

// Special zero-value transfer
function transferZero(address to) public returns (bool) {
    emit Transfer(msg.sender, to, 0);
    emit TransferNotification(msg.sender, to, 0, fromId, toId);
}
```

### Real-time Notifications
```javascript
// Socket.io events
io.to(fromBinanceId).emit('transfer_sent', {
  to: toBinanceId,
  amount,
  message: `Transfer of ${amount} DUSDT sent`
});

io.to(toBinanceId).emit('transfer_received', {
  from: fromBinanceId,
  amount,
  message: `Received ${amount} DUSDT`
});
```

### Transfer API
```javascript
// POST /api/transfer
{
  "fromBinanceId": "user1",
  "toBinanceId": "user2", 
  "amount": 100  // Can be 0
}
```

## 📱 User Interface

### Main Features
- **Registration**: Simple form with Binance ID, Tron address, email
- **Transfer Form**: Send DUSDT between Binance IDs
- **Balance Checker**: View current DUSDT balance
- **Notifications**: Real-time transfer alerts
- **History**: Complete transfer history

### Demo Features Highlighted
- ✅ Transfer any amount including 0 DUSDT
- ✅ Both sender and receiver get notifications
- ✅ Uses Binance IDs instead of wallet addresses
- ✅ No trading or withdrawal restrictions
- ✅ Real-time updates via Socket.io

## 🗂️ Project Structure

```
dusdt-transfer-system/
├── app/                        # Next.js App Router
│   ├── api/                    # API routes
│   │   ├── register/           # User registration
│   │   ├── transfer/           # DUSDT transfers
│   │   ├── balance/            # Balance checking
│   │   ├── transfers/          # Transfer history
│   │   └── notifications/      # Notifications
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                 # React components
│   ├── RegisterForm.tsx        # User registration
│   ├── TransferForm.tsx        # DUSDT transfer
│   ├── BalanceCard.tsx         # Balance display
│   ├── NotificationsList.tsx   # Notifications
│   └── TransferHistory.tsx     # Transfer history
├── hooks/                      # Custom React hooks
│   └── useSocket.ts            # Socket.io hook
├── lib/                        # Utilities and models
│   ├── models/                 # Database models
│   └── socket.js               # Socket.io server
├── contracts/
│   └── DemoUSDT.sol            # TRC20 smart contract
├── server.js                   # Custom Next.js server
└── package.json                # Dependencies
```

## 🎮 Demo Scenarios

### Scenario 1: Zero Value Transfer
1. Register two users
2. Transfer 0 DUSDT from user1 to user2
3. Both users receive notifications
4. Transfer appears in history

### Scenario 2: Regular Transfer
1. Transfer 100 DUSDT from user1 to user2
2. Check balances before and after
3. View notifications and history
4. Verify real-time updates

### Scenario 3: Multiple Transfers
1. Make several transfers between users
2. Check notification history
3. View transfer history for each user
4. Test with different amounts

## 🔍 Verification Checklist

- [ ] Users can register with Binance ID
- [ ] Transfers work with any amount (including 0)
- [ ] Both sender and receiver get notifications
- [ ] Real-time updates work via Socket.io
- [ ] Transfer history is tracked
- [ ] Balances are updated correctly
- [ ] UI is responsive and user-friendly
- [ ] All API endpoints work correctly

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/dusdt_demo
PORT=3000
NODE_ENV=development
```

## 📞 Support

This is a complete demo system that meets all your requirements:
- ✅ TRC20 token (DUSDT)
- ✅ Binance ID transfers
- ✅ Zero value transfers allowed
- ✅ Real-time notifications
- ✅ No trading/withdrawal restrictions
- ✅ Complete UI and backend

The system is ready to run and test immediately!