const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  problemId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  statement: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  testCases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' }],
});

problemSchema.index({ problemId: 1 });

module.exports = mongoose.model('Problem', problemSchema);