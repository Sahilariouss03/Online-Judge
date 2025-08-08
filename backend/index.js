const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const DBConnection = require("./database/db");
const User = require("./models/user");
const userRoutes = require("./routes/user");
const problemRoutes = require("./routes/problem");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const { generateReview } = require("./generateAIReview");

dotenv.config();
DBConnection();

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Body parsing with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser()); // Parse cookies
// CORS configuration for production
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL // Your frontend URL in production
        : "http://localhost:5173", // Development frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400, // 24 hours
  })
);

// Routes
app.use("/users", userRoutes);
app.use("/problems", problemRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/ai-review", async (req, res) => {
  const { code } = req.body;
  if (!code || code.trim() === "") {
    return res.status(400).json({ message: "Code is required" });
  }

  try {
    const aiReview = await generateReview(code);
    return res.json({ review: aiReview });
  } catch (error) {
    console.error("Error during AI review:", error);

    // Return specific error messages to the client
    if (error.message.includes("not configured")) {
      return res
        .status(503)
        .json({
          message:
            "AI review service is not configured. Please contact the administrator.",
        });
    } else if (error.message.includes("temporarily unavailable")) {
      return res
        .status(503)
        .json({
          message:
            "AI review service is temporarily unavailable. Please try again later.",
        });
    } else {
      return res
        .status(500)
        .json({
          message: "Failed to generate AI review. Please try again later.",
        });
    }
  }
});

app.post("/register", async (req, res) => {
  try {
    let { firstName, LastName, email, password } = req.body;

    // Input validation
    if (!firstName || !LastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Password strength validation
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Sanitize inputs
    firstName = firstName.trim().replace(/[<>]/g, "");
    LastName = LastName.trim().replace(/[<>]/g, "");
    email = email.trim().toLowerCase();
    email = email.trim().toLowerCase(); // Normalize email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.BCRYPT_ROUNDS) || 10
    );
    const newUser = await User.create({
      firstName,
      LastName,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign({ id: newUser._id, email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });

    // Set JWT token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS in production
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        firstName: newUser.firstName,
        LastName: newUser.LastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error from MongoDB
      return res.status(400).json({ message: "User already exists" });
    }
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      }
    );

    // Set JWT token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS in production
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.json({
      message: "Login successful",
      user: {
        firstName: user.firstName,
        LastName: user.LastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/login/admin", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    email = email.trim().toLowerCase();
    const user = await User.findOne({ email, isAdmin: true });
    if (!user) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: true },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      }
    );

    // Set JWT token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS in production
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.json({
      message: "Admin login successful",
      user: {
        firstName: user.firstName,
        LastName: user.LastName,
        email: user.email,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/logout", (req, res) => {
  // Clear the JWT cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const execute = async (filePath, outputPath) => {
  const jobId = path.basename(filePath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.exe`);
  return new Promise((resolve, reject) => {
    exec(
      `g++ ${filePath} -o ${outPath} && cd ${outputPath} && ./${jobId}.exe`,
      (error, stdout, stderr) => {
        if (error) return reject(error.message);
        if (stderr) return reject(stderr);
        resolve(stdout);
      }
    );
  });
};

module.exports = execute;
