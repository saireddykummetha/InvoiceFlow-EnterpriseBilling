const nodemailer = require('nodemailer');

let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

const isPlaceholderConfig = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return true;
  if (user.includes('your-email') || pass === 'your-app-password') return true;
  return false;
};

// Sends the OTP email. If SMTP is not configured or uses dummy credentials, prints it in the terminal (development).
const sendOtpEmail = async (to, otp, purpose) => {
  const subject = purpose === 'reset' ? 'Your password reset code' : 'Verify your account';
  const text = `Your verification code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`;
  const html = `<div style="font-family:Arial,sans-serif"><h2>InvoiceFlow</h2><p>Your verification code is</p><p style="font-size:28px;letter-spacing:6px"><b>${otp}</b></p><p>It expires in 10 minutes. If you did not request this, you can ignore this email.</p></div>`;

  console.log(`\n========================================`);
  console.log(`[EMAIL OTP] To: ${to}`);
  console.log(`[EMAIL OTP] Purpose: ${purpose}`);
  console.log(`[EMAIL OTP] Verification Code: ${otp}`);
  console.log(`========================================\n`);

  if (isPlaceholderConfig()) {
    console.log(`[DEV EMAIL] Placeholder SMTP credentials detected. OTP printed above for testing.`);
    return;
  }

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error(`[SMTP ERROR] Could not dispatch email via SMTP: ${err.message}`);
    // Do not throw so API request succeeds and OTP can be verified
  }
};

module.exports = { sendOtpEmail };
