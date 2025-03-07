//NEW API KEY: re_M529Q2jK_AKfkSp216tCsxzDvH83LtMDG
//NAME: NOMBytes

/*import { Resend } from 'resend'; //ei toimi?
import express from 'express';
import mysql from 'mysql2/promise';
*/
const express = require('express');
const { Resend } = require('resend');
const db = require('../db.js'); // ✅ Use the existing connection

const router = express.Router();
const resend = new Resend('re_M529Q2jK_AKfkSp216tCsxzDvH83LtMDG'); // Your API key

// Function to send the reset email
async function sendPasswordResetEmail(userEmail, resetLink) {
    try {
        const response = await resend.emails.send({
            //from: 'passwordreset.nombytes@noreply.com',
            from: 'onboarding@resend.dev', //mock email
            to: userEmail,
            subject: 'Password Reset Request',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password to NOMBytes.</p>`,
        });

        console.log('Email sent:', response);
        return response;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        console.log("Received password reset request for:", email);

        // Check if email exists in the database
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            console.log("Email found in database:", email);

            // Generate a reset token (random string)
            const resetToken = Math.random().toString(36).substr(2, 10);
            //const resetLink = `https://yourapp.com/reset-password?token=${resetToken}`; //DONT GO HERE
            const resetLink = `http://localhost:3000/reset-password.html?email=${encodeURIComponent(email)}`;


            // Send the password reset email
            await sendPasswordResetEmail(email, resetLink);
            console.log("Reset email sent successfully.");
        } else {
            console.log("Email not found in database:", email);
        }

        // Always return a success message to prevent email guessing
        res.json({ message: 'If your email exists, you will receive a password reset link.' });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

const bcrypt = require("bcrypt"); // For password hashing

//RESET PASSWORD ENDPOINT
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body; // ✅ Use email instead of token

  try {
      console.log("Received reset request for email:", email);

      // Ensure the email exists in the database
      const [rows] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);

      if (rows.length === 0) {
          console.log("Email not found in database:", email);
          return res.status(400).json({ error: "Invalid email." });
      }

      const userId = rows[0].id;
      console.log("User found, ID:", userId);

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log("New hashed password:", hashedPassword);

      // Update password using email
      const [updateResult] = await db.execute(
          "UPDATE users SET password_hash = ? WHERE email = ?", 
          [hashedPassword, email]
      );

      console.log("Database update result:", updateResult);

      if (updateResult.affectedRows === 0) {
          console.error("Password update failed.");
          return res.status(500).json({ error: "Password update failed." });
      }

      console.log("Password updated successfully.");
      res.json({ message: "Password reset successful!" });

  } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: "Something went wrong" });
  }
});



// Export the router using CommonJS
module.exports = router;




/*
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
*/
