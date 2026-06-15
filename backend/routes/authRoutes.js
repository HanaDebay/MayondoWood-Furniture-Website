// Dependencies
const express = require("express");
const path = require("path");
const router = express.Router();
const User = require("../models/userModel");
const multer = require("multer");

const passport = require("passport");
const bcrypt = require("bcrypt"); //bcrypt is a library for hashing passwords securely.
const { error } = require("console");
const saltRounds = 10; //A salt is random data added to the password before hashing.

let storage = multer.diskStorage({
  destination: (req , file , cb) => {
    cb(null, "public/uploads")
  },
   filename: (req , file , cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({storage})

// GET Routes
router.get("/register-user", (req, res) => {
  res.json({ message: "Send POST to /api/register-user with registration data" });
});

router.post("/register-user", async (req, res) => {
  try {
    const { fullName, email, phone, username, password, confirmPassword, role } = req.body;

    if (!fullName || !email || !phone || !username || !role || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!/^(?:\+256|0)\d{9}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Register new user
    const user = new User({ fullName, email, phone, username, role });
    await User.register(user, password);

    res.status(201).json({ message: "User registered successfully", role });

  } catch (error) {
    console.error("Registration error:", error);

    // Duplicate username
    if (error.name === "UserExistsError") {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Mongo duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already in use` });
    }
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

router.get("/login", (req, res) => {
  res.json({ message: "Send POST to /api/login with email and password" });
});

router.get("/me", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      console.error("Passport authentication error:", err);
      return res.status(500).json({ error: "Server error during authentication" });
    }
    if (!user) {
      // Authentication failed (e.g., bad username/password)
      return res.status(401).json({ message: info.message || "Invalid credentials" });
    }

    req.logIn(user, async (err) => { // Made async to use await for User.findById
      if (err) {
        console.error("req.logIn error:", err);
        return res.status(500).json({ error: "Could not log in user" });
      }

    const sessionUser = {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage || null,
    };
      // Fetch the full user object to store in session
      const fullUser = await User.findById(user._id).lean();
      if (!fullUser) {
        return res.status(500).json({ error: "User data not found after login" });
      }

      // Store full user object and role in session
      req.session.user = fullUser; 
      req.session.role = fullUser.role;
      
      // Return success with user role
      return res.status(200).json({ message: "Login successful", user: fullUser });
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.clearCookie("connect.sid"); // clear session cookie
    res.status(200).json({ message: "Logged out successfully" }); // Return JSON for frontend
  });
});

router.get("/register-manager", (req, res) => {
  res.json({ message: "Send POST to /api/register-manager with manager data" });
});

router.post("/register-manager", upload.single("profileImage"), async (req, res) => {
  try {
    const { fullName, email, phone, username, password } = req.body;
    // Check if manager already exists
    const existingManager = await User.findOne({ $or: [{email},{username}] });
    if (existingManager) {
      return res.status(400).json({ error: "Manager with this email or username already exists!" });
    }

    const manager = new User({
      fullName,
      email,
      phone,
      username,
      role: "Manager",
      profileImage: req.file ? req.file.filename : null
    });

    await User.register(manager, password);
    res.status(201).json({ message: "Manager registered successfully" }); // Return JSON for frontend
  } catch (error) {
    console.error("Error registering manager:", error);
    res.status(500).json({ error: "Server error. Please try again." });
    res.status(500).json({ error: "Server error. Please try again." }); // Return JSON error
  }
});


module.exports = router;
