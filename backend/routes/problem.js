const express = require('express');
const Problem = require('../models/problem.js');
const authMiddleware = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/auth');
const axios = require('axios');
const router = express.Router();

// Create Problem (Authenticated user)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { problemId, name, statement, difficulty } = req.body;
    if (!problemId || !name || !statement || !difficulty) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingProblem = await Problem.findOne({ problemId });
    if (existingProblem) {
      return res.status(400).json({ message: 'Problem ID already exists' });
    }
    const problem = await Problem.create({ problemId, name, statement, difficulty });
    res.status(201).json({ message: 'Problem created', problem });
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read All Problems (Public)
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().select('-testCases');
    res.json({ message: 'Problems retrieved', problems });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read Single Problem (Public)
router.get('/:problemId', async (req, res) => {
  try {
    const problem = await Problem.findOne({ problemId: req.params.problemId }).select('-testCases');
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json({ message: 'Problem retrieved', problem });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Run Code (Authenticated user)
router.post('/:problemId/run', authMiddleware, async (req, res) => {
  try {
    const { code, input } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Code is required' });
    }

    // Send code to compiler service
    const compilerResponse = await axios.post('http://localhost:5000/run', {
      code,
      input: input || '',
      language: 'cpp'
    });

    res.json({ 
      message: 'Code executed successfully',
      output: compilerResponse.data.output 
    });
  } catch (error) {
    console.error('Error running code:', error);
    if (error.response?.data?.error) {
      res.status(400).json({ message: error.response.data.error });
    } else {
      res.status(500).json({ message: 'Failed to execute code' });
    }
  }
});

// Submit Solution (Authenticated user)
router.post('/:problemId/submit', authMiddleware, async (req, res) => {
  try {
    const { code, input } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Code is required' });
    }

    // For now, just run the code and return the result
    // In a real implementation, you would run against test cases
    const compilerResponse = await axios.post('http://localhost:5000/run', {
      code,
      input: input || '',
      language: 'cpp'
    });

    res.json({ 
      message: 'Solution submitted successfully',
      output: compilerResponse.data.output,
      status: 'accepted' // In real implementation, this would be based on test case results
    });
  } catch (error) {
    console.error('Error submitting solution:', error);
    if (error.response?.data?.error) {
      res.status(400).json({ message: error.response.data.error });
    } else {
      res.status(500).json({ message: 'Failed to submit solution' });
    }
  }
});

// Update Problem (Authenticated user)
router.put('/:problemId', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, statement, difficulty } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (statement) updates.statement = statement;
    if (difficulty) updates.difficulty = difficulty;

    const problem = await Problem.findOneAndUpdate(
      { problemId: req.params.problemId },
      updates,
      { new: true }
    ).select('-testCases');
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json({ message: 'Problem updated', problem });
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete Problem (Authenticated user)
router.delete('/:problemId', authMiddleware, isAdmin, async (req, res) => {
  try {
    const problem = await Problem.findOneAndDelete({ problemId: req.params.problemId });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json({ message: 'Problem deleted' });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;