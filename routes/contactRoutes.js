const express = require("express");
const router = express.Router();
const sendMail = require("../utils/mailService");

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log("CONTACT REQUEST:", {
      name,
      email,
      subject,
      message: message ? "received" : "missing",
    });

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    await sendMail(
      "ronak.universebyte@gmail.com",
      `New Contact Form - ${subject}`,
      `
        <h2>New Contact Form</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    );

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("CONTACT API ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
});

module.exports = router;
