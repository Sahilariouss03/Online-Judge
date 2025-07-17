const express = require('express');
const User = require('../models/user');
const authMiddleware = require('../middlewares/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Update User (Authenticated user)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, LastName, email, password } = req.body;
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (LastName) updates.LastName = LastName;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete User (Authenticated user)
router.delete('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;