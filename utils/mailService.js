const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,

  family: 4,

  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

const sendMail = async (to, subject, html) => {
  try {
    console.log("📧 Testing Gmail SMTP...");

    await transporter.verify();

    console.log("✅ Gmail SMTP connected");

    const info = await transporter.sendMail({
      from: `"UniverseByte" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email Sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ SMTP ERROR:", error);
    throw error;
  }
};

module.exports = sendMail;
