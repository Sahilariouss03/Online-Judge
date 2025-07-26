const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const DBConnection = require('./database/db');
const User = require('./models/user');
const userRoutes = require('./routes/user');
const problemRoutes = require('./routes/problem');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

dotenv.config();
DBConnection();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:5173' }));

// Routes
app.use('/users', userRoutes);
app.use('/problems', problemRoutes);

// Basic route for testing 
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

app.post('/register/admin', async (req, res) => {
  try {
    let { firstName, LastName, email, password } = req.body;
    if (!firstName || !LastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    email = email.trim().toLowerCase();
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
      isAdmin: true
    });
    const token = jwt.sign({ id: newUser._id, email, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(201).json({
      message: 'Admin registered successfully',
      token,
      user: {
        firstName: newUser.firstName,
        LastName: newUser.LastName,
        email: newUser.email,
        isAdmin: true
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    console.error('Error during admin registration:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({
      message: 'Login successful',
      token,
      user: {
        firstName: user.firstName,
        LastName: user.LastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/login/admin', async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    email = email.trim().toLowerCase();
    const user = await User.findOne({ email, isAdmin: true });
    if (!user) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }
    const token = jwt.sign({ id: user._id, email: user.email, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({
      message: 'Admin login successful',
      token,
      user: {
        firstName: user.firstName,
        LastName: user.LastName,
        email: user.email,
        isAdmin: true
      },
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const execute = async (filePath, outputPath) => {
    const jobId = path.basename(filePath).split('.')[0];
    const outPath = path.join(outputPath, `${jobId}.exe`);
    return new Promise((resolve, reject) => {
        exec(`g++ ${filePath} -o ${outPath} && cd ${outputPath} && ./${jobId}.exe`, (error, stdout, stderr) => {
            if (error) return reject(error.message);
            if (stderr) return reject(stderr);
            resolve(stdout);
        });
    });
};

module.exports = execute;