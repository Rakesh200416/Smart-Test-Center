const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");

const User = require("../models/User");
const auth = require("../middleware/auth");
const { protect } = require("../middleware/authMiddleware");

function sign(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "1d",
  });
}

/* ----------------- Multer setup for avatar upload ----------------- */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* ----------------- Signup ----------------- */
router.post("/signup", upload.single("avatar"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "mentor"].includes(role)) {
      return res.status(400).json({ message: "Role must be student or mentor" });
    }

    const exists = await User.findOne({ email: req.body.email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "User already exists" });

    // avatar: if file uploaded use that, else use default
    let avatarPath = req.file
      ? `/uploads/${req.file.filename}`
      : "/uploads/default.png";

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role,
      avatar: avatarPath,
    });

    if (role === "student") {
      user.student = {
        contactNumber: req.body.contactNumber || "",
        educationLevel: req.body.educationLevel || "",
        institutionName: req.body.institutionName || "",
      };
    } else if (role === "mentor") {
      user.mentor = {
        phoneNumber: req.body.phoneNumber || "",
        currentInstitution: req.body.currentInstitution || "",
        experience: req.body.experience || "",
      };
    }

    await user.save();
    const token = sign(user);
    return res.json({ token, user: user.safe() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ----------------- Login (student/mentor) ----------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    if (user.role === "admin") {
      return res.status(403).json({ message: "Use /admin/login for admin" });
    }

    const token = sign(user);
    return res.json({ token, user: user.safe() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ----------------- Admin Login ----------------- */
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email.toLowerCase(),
      role: "admin",
    });
    if (!user) return res.status(400).json({ message: "Invalid admin credentials" });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid admin credentials" });

    const token = sign(user);
    return res.json({ token, user: user.safe() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ----------------- Get Profile ----------------- */
router.get("/me", protect, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      console.error('No user in request object');
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user: user.safe() });
  } catch (e) {
    console.error('Get profile error:', e);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ----------------- Update Profile (with avatar upload) ----------------- */
router.put("/me", protect, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      console.error('No user in request object for profile update');
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // basic fields
    user.name = req.body.name || user.name;
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    if (user.role === "student") {
      if (!user.student) user.student = {};
      user.student.educationLevel =
        req.body.educationLevel || user.student.educationLevel;
      user.student.institutionName =
        req.body.institutionName || user.student.institutionName;
      user.student.contactNumber =
        req.body.contactNumber || user.student.contactNumber;
    }

    if (user.role === "mentor") {
      if (!user.mentor) user.mentor = {};
      user.mentor.currentInstitution =
        req.body.currentInstitution || user.mentor.currentInstitution;
      user.mentor.phoneNumber =
        req.body.phoneNumber || user.mentor.phoneNumber;
      user.mentor.experience =
        req.body.experience || user.mentor.experience;
    }

    await user.save();
    return res.json({ user: user.safe() });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

/* ----------------- Forgot Password ----------------- */
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "Email not found" });

    // TODO: implement actual email sending here
    return res.json({ message: `Reset link sent to ${email}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;