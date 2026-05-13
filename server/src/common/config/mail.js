import nodemailer from "nodemailer"
import dotenv from "dotenv";
dotenv.config();



const getTransporter = () => {
  return nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export const sendVerificationEmail = async (email, rawToken) => {
  const transporter = getTransporter();
  
  await transporter.sendMail({
    from: `${process.env.SMTP_FROM_EMAIL}`,
    to: email,
    subject: "Email Verification",
    text: `Your verification token: ${rawToken}`,
    html: `
    <h2>Verify Your Email</h2>
    <p>Thank you for registering!</p>
    <p><strong>Token:</strong> ${rawToken}</p>
    <p style="color: #666; font-size: 12px;">This token will expire in 15 minutes.</p>
    `,
  });
};