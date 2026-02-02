const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    // For development, use Ethereal (fake SMTP)
    // For production, configure real SMTP (Gmail, SendGrid, etc.)

    if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
        // Production SMTP configuration
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Development - use console logging fallback or Ethereal
    return null;
};

/**
 * Send OTP Email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<object>} - Email send result
 */
const sendOTPEmail = async (email, otp) => {
    const transporter = createTransporter();

    const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
                .container { max-width: 500px; margin: 0 auto; padding: 40px 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 28px; font-weight: 700; color: #667eea; }
                .otp-box { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    margin: 20px 0;
                }
                .otp-code { 
                    font-size: 36px; 
                    font-weight: 700; 
                    color: white; 
                    letter-spacing: 8px;
                    margin: 0;
                }
                .message { color: #64748b; line-height: 1.6; }
                .warning { 
                    background: #fef3c7; 
                    border: 1px solid #f59e0b; 
                    border-radius: 8px; 
                    padding: 15px; 
                    margin-top: 20px;
                    font-size: 14px;
                    color: #92400e;
                }
                .footer { 
                    text-align: center; 
                    margin-top: 30px; 
                    color: #94a3b8; 
                    font-size: 12px; 
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">📊 TaskPulse</div>
                </div>
                
                <h2 style="color: #1e293b; margin-bottom: 10px;">Verify Your Email</h2>
                <p class="message">
                    Use the verification code below to complete your registration on TaskPulse.
                </p>
                
                <div class="otp-box">
                    <p class="otp-code">${otp}</p>
                </div>
                
                <p class="message">
                    Enter this code in the verification field to confirm your email address.
                </p>
                
                <div class="warning">
                    ⚠️ This code expires in <strong>5 minutes</strong>. Do not share this code with anyone.
                </div>
                
                <div class="footer">
                    <p>This email was sent by TaskPulse. If you didn't request this verification, please ignore this email.</p>
                    <p>© ${new Date().getFullYear()} TaskPulse - Internal Work Reporting System</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const mailOptions = {
        from: process.env.SMTP_FROM || '"TaskPulse" <noreply@taskpulse.local>',
        to: email,
        subject: '🔐 TaskPulse - Email Verification Code',
        html: emailHTML,
        text: `Your TaskPulse verification code is: ${otp}\n\nThis code expires in 5 minutes.\n\nIf you didn't request this, please ignore this email.`
    };

    // If transporter exists (production), send real email
    if (transporter) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('📧 Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Email send error:', error);
            throw error;
        }
    }

    // Development fallback - log to console
    console.log('\n' + '='.repeat(50));
    console.log('📧 EMAIL OTP (Development Mode)');
    console.log('='.repeat(50));
    console.log(`To: ${email}`);
    console.log(`Subject: TaskPulse - Email Verification Code`);
    console.log(`OTP Code: ${otp}`);
    console.log('='.repeat(50) + '\n');

    return { success: true, messageId: 'dev-mode', otp }; // Include OTP in dev mode for testing
};

/**
 * Send Password Reset Email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @returns {Promise<object>} - Email send result
 */
const sendPasswordResetEmail = async (email, resetToken) => {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password.html?token=${resetToken}`;

    const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
                .container { max-width: 500px; margin: 0 auto; padding: 40px 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 28px; font-weight: 700; color: #667eea; }
                .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px 40px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    margin: 20px 0;
                }
                .message { color: #64748b; line-height: 1.6; }
                .warning { 
                    background: #fef3c7; 
                    border: 1px solid #f59e0b; 
                    border-radius: 8px; 
                    padding: 15px; 
                    margin-top: 20px;
                    font-size: 14px;
                    color: #92400e;
                }
                .footer { 
                    text-align: center; 
                    margin-top: 30px; 
                    color: #94a3b8; 
                    font-size: 12px; 
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">📊 TaskPulse</div>
                </div>
                
                <h2 style="color: #1e293b; margin-bottom: 10px;">Reset Your Password</h2>
                <p class="message">
                    We received a request to reset your password. Click the button below to create a new password.
                </p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <div class="warning">
                    ⚠️ This link expires in <strong>1 hour</strong>. If you didn't request this, please ignore this email.
                </div>
                
                <div class="footer">
                    <p>This email was sent by TaskPulse. Your password won't change until you access the link above and create a new one.</p>
                    <p>© ${new Date().getFullYear()} TaskPulse - Internal Work Reporting System</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const mailOptions = {
        from: process.env.SMTP_FROM || '"TaskPulse" <noreply@taskpulse.local>',
        to: email,
        subject: '🔐 TaskPulse - Password Reset Request',
        html: emailHTML,
        text: `Reset your TaskPulse password: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`
    };

    if (transporter) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('📧 Password reset email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Email send error:', error);
            throw error;
        }
    }

    // Development fallback
    console.log('\n' + '='.repeat(50));
    console.log('📧 PASSWORD RESET EMAIL (Development Mode)');
    console.log('='.repeat(50));
    console.log(`To: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('='.repeat(50) + '\n');

    return { success: true, messageId: 'dev-mode', resetUrl };
};

module.exports = {
    sendOTPEmail,
    sendPasswordResetEmail
};
