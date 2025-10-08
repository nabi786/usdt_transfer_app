const TronWeb = require('tronweb');
const User = require('../models/User');
const Transfer = require('../models/Transfer');
const Notification = require('../models/Notification');
const notificationService = require('./notificationService');

class TronService {
  constructor() {
    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_NETWORK === 'mainnet' 
        ? 'https://api.trongrid.io' 
        : 'https://api.shasta.trongrid.io',
      privateKey: process.env.TRON_PRIVATE_KEY || "c11d680ad95dcb9913389c924a5608497e31af32b33bce2e00598f5701088b4c"
    });
    
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.contract = null;
  }

  async initializeContract() {
    try {
      // Contract ABI (simplified for demo)
      const contractABI = [
        {
          "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}],
          "name": "transfer",
          "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
          "name": "isBinanceUserCheck",
          "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];

      this.contract = await this.tronWeb.contract(contractABI, this.contractAddress);
      console.log('Tron contract initialized successfully');
    } catch (error) {
      console.error('Error initializing Tron contract:', error);
      throw error;
    }
  }

  async transferTokens(fromBinanceId, toBinanceId, amount) {
    try {
      // Get user addresses
      const fromUser = await User.findOne({ binanceId: fromBinanceId });
      const toUser = await User.findOne({ binanceId: toBinanceId });

      if (!fromUser || !toUser) {
        throw new Error('One or both users not found');
      }

      // Check if users are registered as Binance users in the contract
      const fromIsBinanceUser = await this.contract.isBinanceUserCheck(fromUser.tronAddress).call();
      const toIsBinanceUser = await this.contract.isBinanceUserCheck(toUser.tronAddress).call();

      if (!fromIsBinanceUser || !toIsBinanceUser) {
        throw new Error('One or both users are not registered as Binance users in the contract');
      }

      // Convert amount to contract units (6 decimals)
      const contractAmount = this.tronWeb.toBigNumber(amount).times(1000000);

      // Create transfer record
      const transfer = new Transfer({
        fromBinanceId,
        toBinanceId,
        fromTronAddress: fromUser.tronAddress,
        toTronAddress: toUser.tronAddress,
        amount: contractAmount.toNumber(),
        transactionHash: '', // Will be updated after transaction
        status: 'pending'
      });

      await transfer.save();

      try {
        // Execute transfer on blockchain
        const transaction = await this.contract.transfer(toUser.tronAddress, contractAmount).send({
          feeLimit: 100000000,
          callValue: 0,
          shouldPollResponse: true
        });

        // Update transfer record with transaction hash
        transfer.transactionHash = transaction.txid;
        transfer.status = 'completed';
        transfer.completedAt = new Date();
        await transfer.save();

        // Update user balances
        fromUser.balance -= amount;
        toUser.balance += amount;
        await fromUser.save();
        await toUser.save();

        // Send notifications
        await this.sendTransferNotifications(transfer);

        return {
          success: true,
          transactionHash: transaction.txid,
          transferId: transfer._id
        };

      } catch (blockchainError) {
        // Update transfer record with error
        transfer.status = 'failed';
        transfer.errorMessage = blockchainError.message;
        await transfer.save();

        throw blockchainError;
      }

    } catch (error) {
      console.error('Transfer error:', error);
      throw error;
    }
  }

  async sendTransferNotifications(transfer) {
    try {
      const fromUser = await User.findOne({ binanceId: transfer.fromBinanceId });
      const toUser = await User.findOne({ binanceId: transfer.toBinanceId });

      // Create notifications
      const senderNotification = new Notification({
        userId: fromUser._id,
        binanceId: fromUser.binanceId,
        type: 'transfer_sent',
        title: 'Transfer Sent',
        message: `You have successfully sent ${transfer.amount / 1000000} DUSDT to ${transfer.toBinanceId}`,
        transferId: transfer._id
      });

      const receiverNotification = new Notification({
        userId: toUser._id,
        binanceId: toUser.binanceId,
        type: 'transfer_received',
        title: 'Transfer Received',
        message: `You have received ${transfer.amount / 1000000} DUSDT from ${transfer.fromBinanceId}`,
        transferId: transfer._id
      });

      await Promise.all([
        senderNotification.save(),
        receiverNotification.save()
      ]);

      // Send email notifications
      await Promise.all([
        notificationService.sendEmailNotification(fromUser.email, senderNotification),
        notificationService.sendEmailNotification(toUser.email, receiverNotification)
      ]);

      // Update notification sent status
      transfer.notificationSent.sender = true;
      transfer.notificationSent.receiver = true;
      await transfer.save();

    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  async getBalance(binanceId) {
    try {
      const user = await User.findOne({ binanceId });
      if (!user) {
        throw new Error('User not found');
      }

      const balance = await this.contract.balanceOf(user.tronAddress).call();
      return this.tronWeb.fromSun(balance.toString()) / 1000000; // Convert to token units
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  async registerBinanceUser(binanceId, tronAddress) {
    try {
      // This would typically be called by the contract owner
      // For demo purposes, we'll simulate this
      console.log(`Registering Binance user: ${binanceId} with address: ${tronAddress}`);
      return true;
    } catch (error) {
      console.error('Error registering Binance user:', error);
      throw error;
    }
  }
}

module.exports = new TronService();






