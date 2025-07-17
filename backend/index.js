const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const DBConnection = require('./database/db');
const User = require('./models/user');
const userRoutes = require('./routes/user');

dotenv.config();
DBConnection();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/register', async (req, res) => {
  try {
    let { firstName, LastName, email, password } = req.body;
    if (!firstName || !LastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    email = email.trim().toLowerCase(); // Normalize email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      firstName,
      LastName,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign({ id: newUser._id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        firstName: newUser.firstName,
        LastName: newUser.LastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error from MongoDB
      return res.status(400).json({ message: 'User already exists' });
    }
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});