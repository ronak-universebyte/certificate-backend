const express = require("express");
const router = express.Router();
const sendMail = require("../utils/mailService");

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

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

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
    });
  }
});

module.exports = router;
