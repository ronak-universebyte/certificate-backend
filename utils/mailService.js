const nodemailer = require("nodemailer");
const dns = require("dns").promises;

const sendMail = async (to, subject, html) => {
  try {
    console.log("📧 Resolving Gmail IPv4...");

    const ipv4Addresses = await dns.resolve4("smtp.gmail.com");

    if (!ipv4Addresses || ipv4Addresses.length === 0) {
      throw new Error("Unable to resolve Gmail IPv4 address");
    }

    const ipv4 = ipv4Addresses[0];

    console.log("✅ Gmail IPv4:", ipv4);

    const transporter = nodemailer.createTransport({
      host: ipv4,
      port: 587,
      secure: false,
      requireTLS: true,
      family: 4,

      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },

      tls: {
        servername: "smtp.gmail.com",
      },

      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });

    console.log("📧 Sending Gmail SMTP email...");

    const info = await transporter.sendMail({
      from: `"UniverseByte" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email Sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ SMTP ERROR:", {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      address: error.address,
      port: error.port,
      command: error.command,
      message: error.message,
    });

    throw error;
  }
};

module.exports = sendMail;
