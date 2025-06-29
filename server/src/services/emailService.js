import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to iknowpdf!',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to iknowpdf, ${data.name}!</h1>
        <p>Thank you for joining iknowpdf. You're now ready to start processing your PDF files with our powerful toolkit.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What you can do with your free account:</h3>
          <ul>
            <li>Process up to 3 files per day</li>
            <li>Upload files up to 50MB</li>
            <li>Access core PDF tools</li>
            <li>Secure file processing</li>
          </ul>
        </div>
        <p>Ready to get started? <a href="${process.env.FRONTEND_URL}/tools" style="color: #2563eb;">Explore our tools</a></p>
        <p>Best regards,<br>The iknowpdf Team</p>
      </div>
    `
  },

  'subscription-activated': {
    subject: 'Subscription Activated - iknowpdf',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Subscription Activated!</h1>
        <p>Hi ${data.name},</p>
        <p>Your ${data.plan} subscription has been successfully activated. You now have access to premium features!</p>
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3>Your ${data.plan} Plan Includes:</h3>
          <ul>
            <li>Unlimited daily tasks</li>
            <li>Larger file size limits</li>
            <li>Priority support</li>
            <li>Advanced PDF tools</li>
            ${data.plan === 'premium' ? '<li>Team collaboration features</li>' : ''}
          </ul>
        </div>
        <p>Amount: ${data.amount}/month</p>
        <p><a href="${process.env.FRONTEND_URL}/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to Dashboard</a></p>
        <p>Thank you for choosing iknowpdf!</p>
      </div>
    `
  },

  'payment-confirmation': {
    subject: 'Payment Confirmation - iknowpdf',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Payment Confirmation</h1>
        <p>Hi ${data.name},</p>
        <p>We've successfully received your payment. Here are the details:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%;">
            <tr><td><strong>Amount:</strong></td><td>${data.currency} ${data.amount}</td></tr>
            <tr><td><strong>Payment ID:</strong></td><td>${data.payment_id}</td></tr>
            <tr><td><strong>Date:</strong></td><td>${data.date}</td></tr>
          </table>
        </div>
        <p>Your subscription will continue uninterrupted. Thank you for your continued trust in iknowpdf!</p>
        <p>Best regards,<br>The iknowpdf Team</p>
      </div>
    `
  },

  'payment-failed': {
    subject: 'Payment Failed - iknowpdf',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Payment Failed</h1>
        <p>Hi ${data.name},</p>
        <p>We were unable to process your payment for your iknowpdf subscription.</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
          <p><strong>Reason:</strong> ${data.reason}</p>
        </div>
        <p>Please update your payment method to continue enjoying our services.</p>
        <p><a href="${process.env.FRONTEND_URL}/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Update Payment Method</a></p>
        <p>If you need assistance, please contact our support team.</p>
      </div>
    `
  },

  'subscription-cancelled': {
    subject: 'Subscription Cancelled - iknowpdf',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">Subscription Cancelled</h1>
        <p>Hi ${data.name},</p>
        <p>Your iknowpdf subscription has been cancelled as requested.</p>
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p>Your subscription will remain active until <strong>${data.end_date}</strong>.</p>
          <p>After this date, your account will be downgraded to the free plan.</p>
        </div>
        <p>We're sorry to see you go! If you change your mind, you can reactivate your subscription anytime.</p>
        <p><a href="${process.env.FRONTEND_URL}/pricing" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reactivate Subscription</a></p>
      </div>
    `
  },

  'processing-completed': {
    subject: 'File Processing Completed - iknowpdf',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Processing Completed!</h1>
        <p>Hi ${data.name},</p>
        <p>Your file processing job has been completed successfully.</p>
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Tool:</strong> ${data.tool}</p>
          <p><strong>Files Processed:</strong> ${data.fileCount}</p>
          <p><strong>Completed:</strong> ${data.completedAt}</p>
        </div>
        <p><a href="${data.downloadUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Download Results</a></p>
        <p><em>Note: Files will be automatically deleted after 2 hours for security.</em></p>
      </div>
    `
  },

  'processing-failed': {
    subject: 'File Processing Failed - iknowpdf',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Processing Failed</h1>
        <p>Hi ${data.name},</p>
        <p>Unfortunately, we encountered an error while processing your files.</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p><strong>Tool:</strong> ${data.tool}</p>
          <p><strong>Error:</strong> ${data.error}</p>
        </div>
        <p>Please try again or contact our support team if the issue persists.</p>
        <p><a href="${process.env.FRONTEND_URL}/tools" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Try Again</a></p>
      </div>
    `
  },

  'password-reset': {
    subject: 'Password Reset Request - iknowpdf',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Password Reset Request</h1>
        <p>Hi ${data.name},</p>
        <p>You requested to reset your password for your iknowpdf account.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Click the button below to reset your password:</p>
          <p><a href="${data.resetLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
        </div>
        <p><em>This link will expire in 1 hour for security reasons.</em></p>
        <p>If you didn't request this password reset, please ignore this email.</p>
      </div>
    `
  }
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export async function sendEmail({ to, subject, template, data }) {
  try {
    const transporter = createTransporter();
    
    // Get template
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }

    // Prepare email options
    const mailOptions = {
      from: `"iknowpdf" <${process.env.SMTP_USER}>`,
      to,
      subject: subject || emailTemplate.subject,
      html: emailTemplate.html(data)
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    logger.info('Email sent successfully:', {
      to,
      subject: mailOptions.subject,
      messageId: result.messageId
    });

    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    logger.error('Email sending failed:', {
      to,
      template,
      error: error.message
    });
    
    throw error;
  }
}

// Test email configuration
export async function testEmailConfiguration() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email configuration is valid');
    return true;
  } catch (error) {
    logger.error('Email configuration test failed:', error);
    return false;
  }
}