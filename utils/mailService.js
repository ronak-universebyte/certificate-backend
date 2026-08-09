const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendMail = async (to, subject, html) => {
  try {
    console.log("SMTP CONFIG:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      email: process.env.SMTP_EMAIL,
      password: process.env.SMTP_PASSWORD ? "SET" : "MISSING",
    });

    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"UniverseByte" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email Sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ Email Error:", error);

    throw error;
  }
};

module.exports = sendMail;
