const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  problemId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  statement: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    description: { type: String, default: 'Test case' }
  }]
});

// Remove the duplicate index declaration
// problemSchema.index({ problemId: 1 });

module.exports = mongoose.model('Problem', problemSchema);