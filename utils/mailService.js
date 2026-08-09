const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 587,
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

    console.log("Testing SMTP connection...");

    await transporter.verify();

    console.log("SMTP connection successful");

    const info = await transporter.sendMail({
      from: `"UniverseByte" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("Email Sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("SMTP ERROR CODE:", error.code);
    console.error("SMTP ERROR RESPONSE:", error.response);
    console.error("SMTP ERROR MESSAGE:", error.message);
    console.error("FULL SMTP ERROR:", error);

    throw error;
  }
};

module.exports = sendMail;
