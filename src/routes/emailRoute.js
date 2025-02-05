nodemailer = require("nodemailer");
const express = require("express");
const app = express();

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: "julie.hettinger11@ethereal.email", // Replace with Ethereal username
    pass: "UKq8XbvXDkWRxpBUEU", // Replace with Ethereal password
  },
});

// Email Sending Endpoint
app.post("/send-reset-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: "Email is required" });
  }

  // Generate a mock password reset link
  const resetLink = `https://your-app.com/reset-password?token=${Date.now()}`;

  const mailOptions = {
    from: '"NomBytes Support" <no-reply@nombytes.com>',
    to: email,
    subject: "Password Reset Request",
    text: `Here is your password reset link: ${resetLink}`,
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    res.status(200).send({
      message: "Email sent successfully!",
      previewURL: nodemailer.getTestMessageUrl(info), // Useful for testing
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ message: "Failed to send email." });
  }
});
