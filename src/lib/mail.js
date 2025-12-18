import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or use 'smtp.mailtrap.io' for testing
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, // Use an "App Password" if using Gmail
    },
  });

  await transporter.sendMail({
    from: `"SynergyHub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};