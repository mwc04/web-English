const { Test, Question, UserTestResult } = require('../models');

// @desc    Get all tests
// @route   GET /api/tests
// @access  Public
const getTests = async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    res.json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get test by ID with questions
// @route   GET /api/tests/:id
// @access  Public
const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    
    const questions = await Question.find({ test_id: test._id });
    
    res.json({ 
      success: true, 
      data: {
        ...test.toObject(),
        questions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit test answers
// @route   POST /api/tests/:id/submit
// @access  Private
const submitTest = async (req, res) => {
  try {
    const { answers } = req.body;
    const testId = req.params.id;
    const userId = req.user.id;
    
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    
    const questions = await Question.find({ test_id: testId });
    
    let correctCount = 0;
    const detailedAnswers = [];
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correct_answer;
      if (isCorrect) correctCount++;
      
      detailedAnswers.push({
        question_id: question._id,
        user_answer: userAnswer,
        is_correct: isCorrect,
        points_earned: isCorrect ? 1 : 0
      });
    });
    
    const score = (correctCount / test.total_questions) * 100;
    
    const result = await UserTestResult.create({
      user_id: userId,
      test_id: testId,
      score: score,
      total_questions: test.total_questions,
      correct_answers: correctCount,
      wrong_answers: test.total_questions - correctCount,
      answers: detailedAnswers,
      time_spent: req.body.time_spent || 0
    });
    
    res.json({
      success: true,
      data: {
        score: score,
        correct_answers: correctCount,
        total_questions: test.total_questions,
        result_id: result._id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new test
// @route   POST /api/tests
// @access  Private/Admin
const createTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);
    res.status(201).json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update test
// @route   PUT /api/tests/:id
// @access  Private/Admin
const updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    res.json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete test and its questions
// @route   DELETE /api/tests/:id
// @access  Private/Admin
const deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    await Question.deleteMany({ test_id: test._id });
    await UserTestResult.deleteMany({ test_id: test._id });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTests,
  getTestById,
  submitTest,
  createTest,
  updateTest,
  deleteTest
};