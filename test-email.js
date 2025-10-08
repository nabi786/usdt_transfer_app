const nodemailer = require('nodemailer');

// Test email configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'rehanpardesi2018@gmail.com',
    pass: 'dqty rphh xsul pmok'
  }
});

async function testEmail() {
  try {
    console.log('📧 Testing email configuration...');
    
    // Test connection
    await transporter.verify();
    console.log('✅ Email server connection successful!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: 'rehanpardesi2018@gmail.com',
      to: 'rehanpardesi2018@gmail.com',
      subject: 'USDT Transfer System - Email Test',
      html: `
        <h2>🎉 Email Configuration Test</h2>
        <p>Your USDT Transfer System email notifications are working correctly!</p>
        <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
        <p>You will now receive real-time notifications for USDT transfers.</p>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

testEmail();
