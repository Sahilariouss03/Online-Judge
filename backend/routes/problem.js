const express = require('express');
const Problem = require('../models/problem.js');
const authMiddleware = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/auth');
const axios = require('axios');
const router = express.Router();

// Create Problem (Authenticated user)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { problemId, name, statement, difficulty, testCases } = req.body;
    if (!problemId || !name || !statement || !difficulty) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingProblem = await Problem.findOne({ problemId });
    if (existingProblem) {
      return res.status(400).json({ message: 'Problem ID already exists' });
    }
    const problem = await Problem.create({ 
      problemId, 
      name, 
      statement, 
      difficulty,
      testCases: testCases || []
    });
    res.status(201).json({ message: 'Problem created', problem });
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read All Problems (Public)
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json({ message: 'Problems retrieved', problems });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read Single Problem (Public)
router.get('/:problemId', async (req, res) => {
  try {
    const problem = await Problem.findOne({ problemId: req.params.problemId });
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

    // Get the problem to access test cases
    const problem = await Problem.findOne({ problemId: req.params.problemId });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Determine input to use: custom input first, then first test case, then empty
    let inputToUse = '';
    let inputSource = 'empty';
    
    if (input && input.trim() !== '') {
      inputToUse = input;
      inputSource = 'custom';
    } else if (problem.testCases && problem.testCases.length > 0) {
      inputToUse = problem.testCases[0].input;
      inputSource = 'first_test_case';
    }

    // Send code to compiler service
    const compilerResponse = await axios.post('http://localhost:5000/run', {
      code,
      input: inputToUse,
      language: 'cpp'
    });

    res.json({ 
      message: 'Code executed successfully',
      output: compilerResponse.data.output,
      input: inputToUse,
      inputSource: inputSource
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

// Test with Custom Input (Authenticated user)
router.post('/:problemId/test-custom', authMiddleware, async (req, res) => {
  try {
    const { code, input } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Code is required' });
    }

    // Run code with custom input
    const compilerResponse = await axios.post('http://localhost:5000/run', {
      code,
      input: input || '',
      language: 'cpp'
    });

    res.json({ 
      message: 'Code executed with custom input',
      output: compilerResponse.data.output,
      status: 'executed',
      customInput: true,
      input: input || ''
    });
  } catch (error) {
    console.error('Error running code with custom input:', error);
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

    // Get the problem with test cases
    const problem = await Problem.findOne({ problemId: req.params.problemId });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // If no test cases available, run with custom input
    if (!problem.testCases || problem.testCases.length === 0) {
      try {
        const compilerResponse = await axios.post('http://localhost:5000/run', {
          code,
          input: input || '',
          language: 'cpp'
        });
        
        res.json({ 
          message: 'Solution executed with custom input',
          output: compilerResponse.data.output,
          status: 'executed',
          customInput: true
        });
      } catch (error) {
        console.error('Error running code:', error);
        if (error.response?.data?.error) {
          res.status(400).json({ message: error.response.data.error });
        } else {
          res.status(500).json({ message: 'Failed to execute code' });
        }
      }
      return;
    }

    const results = [];
    let passedTests = 0;
    let totalTests = problem.testCases.length;

    console.log(`Processing ${totalTests} test cases for problem ${req.params.problemId}`);

    // Run code against each test case
    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i];
      
      try {
        const compilerResponse = await axios.post('http://localhost:5000/run', {
          code,
          input: testCase.input,
          language: 'cpp'
        });

        const userOutput = compilerResponse.data.output.trim();
        const expectedOutput = testCase.expectedOutput.trim();
        
        const isPassed = userOutput === expectedOutput;
        
        results.push({
          testCaseIndex: i + 1,
          description: testCase.description,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          userOutput: userOutput,
          passed: isPassed
        });

        console.log(`Test case ${i + 1}: ${isPassed ? 'PASSED' : 'FAILED'}`);

        if (isPassed) {
          passedTests++;
        }
      } catch (error) {
        results.push({
          testCaseIndex: i + 1,
          description: testCase.description,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          userOutput: 'Compilation/Runtime Error',
          passed: false,
          error: error.response?.data?.error || 'Execution failed'
        });
      }
    }

    const allPassed = passedTests === totalTests;
    const status = allPassed ? 'accepted' : 'wrong_answer';

    console.log(`Final results: ${passedTests}/${totalTests} passed, ${results.length} total results`);

    res.json({ 
      message: allPassed ? 'All test cases passed!' : 'Some test cases failed',
      status: status,
      passedTests: passedTests,
      totalTests: totalTests,
      results: results,
      summary: {
        passed: passedTests,
        total: totalTests,
        percentage: Math.round((passedTests / totalTests) * 100)
      }
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
    const { name, statement, difficulty, testCases } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (statement) updates.statement = statement;
    if (difficulty) updates.difficulty = difficulty;
    if (testCases) updates.testCases = testCases;

    const problem = await Problem.findOneAndUpdate(
      { problemId: req.params.problemId },
      updates,
      { new: true }
    );
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