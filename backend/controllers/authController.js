
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateOtp = require("../utils/generateOtp");

// Initialize Brevo client only when needed
let brevoClient;

const getBrevoClient = async () => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is missing from environment variables");
  }

  if (!brevoClient) {
    const { BrevoClient } = await import("@getbrevo/brevo");

    brevoClient = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY,
    });
  }

  return brevoClient;
};

// Send OTP using Brevo
const sendOtpEmail = async (email, otp) => {
  const brevo = await getBrevoClient();

  return await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL,
    },
    to: [
      {
        email: email,
      },
    ],
    subject: "DEVLOG Email Verification",
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <body>
          <h1>DEVLOG</h1>
          <h2>Email Verification</h2>
          <p>Your verification OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
          <p>Please do not share this code with anyone.</p>
        </body>
      </html>
    `,
    textContent: `Your DEVLOG verification OTP is ${otp}. It expires in 5 minutes.`,
  });
};


// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Check existing user
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Store user
    await db.query(
      `INSERT INTO users (name, email, password, otp, otp_expiry, is_verified)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, otp, otpExpiry, false]
    );

    // Send OTP through Brevo
    try {
      const emailResponse = await sendOtpEmail(email, otp);

      console.log("DEVLOG OTP email accepted by Brevo:", emailResponse.messageId);

    } catch (emailError) {
      console.error("Brevo email error:", emailError.message);

      return res.status(500).json({
        message: "OTP email failed to send",
      });
    }

    return res.status(201).json({
      message: "OTP sent successfully",
      email,
    });

  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user
    const [results] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = results[0];

    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Check expiry
    if (new Date(user.otp_expiry) < new Date()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    // Verify user
    await db.query(
      `UPDATE users
       SET is_verified = true,
           otp = NULL,
           otp_expiry = NULL
       WHERE email = ?`,
      [email]
    );

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      message: "Account verified successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("OTP verification error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [results] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = results[0];

    // Check email verification
    if (!user.is_verified) {
      return res.status(401).json({
        message: "Please verify your email first",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
