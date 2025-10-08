const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmailNotification(email, notification) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `TRC20 Demo - ${notification.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              ${notification.title}
            </h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              ${notification.message}
            </p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Time:</strong> ${notification.createdAt.toLocaleString()}
              </p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                <strong>Type:</strong> ${notification.type.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <p style="font-size: 14px; color: #888;">
              This is an automated notification from the TRC20 Demo system.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      notification.isEmailSent = true;
      await notification.save();
      
      console.log(`Email notification sent to ${email}`);
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  async createNotification(userId, binanceId, type, title, message, transferId = null) {
    try {
      const notification = new Notification({
        userId,
        binanceId,
        type,
        title,
        message,
        transferId
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getNotifications(binanceId, limit = 50, skip = 0) {
    try {
      const notifications = await Notification.find({ binanceId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('transferId', 'amount fromBinanceId toBinanceId status');

      return notifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId, binanceId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, binanceId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async getUnreadCount(binanceId) {
    try {
      const count = await Notification.countDocuments({
        binanceId,
        isRead: false
      });

      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
