const dotenv = require("dotenv");
const resepti = require("./routes/resepti");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const express = require("express");

dotenv.config();

const app = express();
app.use(express.json());

// Use recipe routes
app.use("/resepti", resepti);
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(__dirname + "/views"));

// Serve Static Files from the 'views' directory
app.use("/assets", express.static(__dirname + "/views/assets"));
app.use("/css", express.static(__dirname + "/views/css"));
app.use("/js", express.static(__dirname + "/views/js"));

// Serve the Main HTML File
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html"); // Serve the index.html file
});
//Serve the Recipes HTML File
app.get("/recipes.html", (req, res) => {
  res.sendFile(__dirname + "/views/recipes.html");
});

// Configure Ethereal Transporter

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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
