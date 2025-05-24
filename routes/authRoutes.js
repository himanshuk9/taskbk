const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken'); // 🔐 Token middleware

// 👤 Register a new user
router.post('/register', register);

// 🔐 Login route
router.post('/login', login);

// 📋 Get all employees (role = employee)
router.get('/employees', async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' });
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

// 🧑‍💼 Get current user info (for dashboard greeting)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // remove password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user info" });
  }
});

module.exports = router;
