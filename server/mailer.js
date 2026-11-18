import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Creates and configures Nodemailer transporter based on .env
 */
function createTransporter() {
  const user = (process.env.GMAIL_USER || process.env.SMTP_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '').trim();

  if (!user || !pass) {
    return null; // SMTP credentials not configured yet
  }

  // If using Gmail directly
  if (process.env.GMAIL_USER || (user && user.includes('@gmail.com'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  // Custom SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Validates email format strictly
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * Sends a 6-digit verification OTP email to user's real email address
 * @param {string} toEmail - Recipient email
 * @param {string} code - 6-digit code
 * @param {'signup' | 'forgot'} type - Type of verification
 */
export async function sendOtpEmail(toEmail, code, type = 'signup') {
  const isForgot = type === 'forgot';
  const subject = isForgot
    ? `SolarCare - Password Reset Code: ${code}`
    : `SolarCare - Email Verification Code: ${code}`;

  const headerTitle = isForgot ? 'Password Reset Request' : 'Verify Your Email Address';
  const actionText = isForgot
    ? 'Use the 6-digit code below to securely reset your SolarCare password.'
    : 'Welcome to SolarCare! Please use the 6-digit verification code below to verify your email address and activate your account.';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #064e3b 0%, #047857 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .logo-title { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
        .logo-sub { font-size: 13px; color: #a7f3d0; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .headline { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .code-box { background: #f8fafc; border: 2px dashed #059669; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .code-digits { font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #047857; margin: 0; }
        .expiry-note { font-size: 12px; color: #64748b; margin-top: 8px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; }
        .security-note { font-size: 12px; color: #dc2626; font-weight: 500; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-title">☀️ SolarCare</h1>
          <div class="logo-sub">Smart Solar Performance Platform</div>
        </div>
        <div class="content">
          <h2 class="headline">${headerTitle}</h2>
          <p class="text">${actionText}</p>
          
          <div class="code-box">
            <div class="code-digits">${code}</div>
            <div class="expiry-note">⏱️ Code expires in <strong>10 minutes</strong></div>
          </div>

          <p class="text">Enter this code on the SolarCare authentication screen to proceed.</p>
          <p class="security-note">⚠️ Agar aap ne ye request nahi ki thi to is email ko ignore karein. Kisi ke sath ye code share na karein.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} SolarCare Platform. All rights reserved.<br>
          Automated security message — please do not reply to this email.
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();

  if (transporter) {
    try {
      const fromAddress = process.env.EMAIL_FROM || `"SolarCare Security" <${process.env.GMAIL_USER || process.env.SMTP_USER}>`;
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      console.log(`[MAIL SERVICE] Email sent successfully to ${toEmail}. MessageId: ${info.messageId}`);
      return { success: true, delivered: true };
    } catch (err) {
      const isBadCredentials = err.message && (err.message.includes('BadCredentials') || err.message.includes('535'));
      console.error(`\n[MAIL SERVICE ERROR] Failed to send email via SMTP to ${toEmail}:`, err.message);

      console.log(`\n======================================================`);
      console.log(`[DEV OTP NOTIFICATION]`);
      console.log(`Recipient Email: ${toEmail}`);
      console.log(`Security Code (OTP): >>> ${code} <<<`);
      console.log(`Reason for email delivery failure:`);
      if (isBadCredentials) {
        console.log(`  👉 Google rejected your login credentials.`);
        console.log(`  👉 Google DOES NOT accept your normal account password.`);
        console.log(`  👉 To receive real emails:`);
        console.log(`     1. Go to https://myaccount.google.com/security`);
        console.log(`     2. Turn ON '2-Step Verification'`);
        console.log(`     3. Go to https://myaccount.google.com/apppasswords`);
        console.log(`     4. Generate a 16-letter App Password and paste in .env`);
      } else {
        console.log(`  👉 ${err.message}`);
      }
      console.log(`======================================================\n`);

      return {
        success: true,
        delivered: false,
        error: isBadCredentials ? 'INVALID_APP_PASSWORD' : err.message,
      };
    }
  } else {
    // Transporter not configured in .env yet
    console.log(`\n======================================================`);
    console.log(`[MAIL SERVICE - GMAIL NOT YET CONFIGURED IN .env]`);
    console.log(`Recipient: ${toEmail}`);
    console.log(`Security Code (OTP): >>> ${code} <<<`);
    console.log(`Purpose: ${type}`);
    console.log(`To receive REAL emails directly into your Gmail:`);
    console.log(`Add your Gmail App Password to .env:`);
    console.log(`  GMAIL_USER=your_email@gmail.com`);
    console.log(`  GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx`);
    console.log(`======================================================\n`);
    return { success: true, delivered: false, notice: 'Logged to server console until .env credentials are provided.' };
  }
}
