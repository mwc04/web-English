const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const Question = require('../models/Question');
const UserTestResult = require('../models/UserTestResult');
const { protect } = require('../middleware/auth');

// GET - Lấy danh sách tests (hỗ trợ lọc theo category)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const tests = await Test.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET - Lấy câu hỏi của test (ẩn đáp án đúng)
router.get('/:id/questions', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Nếu test có content (cấu trúc đặc biệt như THPT), trả về content
    if (test.content && test.content.sections) {
      return res.json({
        success: true,
        data: {
          test: {
            id: test._id,
            title: test.title,
            description: test.description,
            category: test.category,
            duration_minutes: test.duration_minutes,
            total_questions: test.total_questions
          },
          content: test.content,
          examType: 'structured' // báo frontend dùng giao diện đặc biệt
        }
      });
    }
    
    const allQuestions = await Question.find({ test_id: test._id });
    
    // Tách parent questions (không có parent) và sub-questions
    const parentQuestions = allQuestions.filter(q => !q.parent_id);
    const subQuestions = allQuestions.filter(q => q.parent_id);
    
    // Gom sub-questions vào parent
    const questionsForUser = parentQuestions.map(q => {
      const subs = subQuestions.filter(sq => sq.parent_id.toString() === q._id.toString());
      const qObj = {
        id: q._id,
        part: q.part,
        question_type: q.question_type,
        instruction: q.instruction,
        question_text: q.question_text,
        options_json: q.options_json,
        passage: q.passage,
        audio_url: q.audio_url,
        image_url: q.image_url,
        group_label: q.group_label
      };
      if (subs.length > 0) {
        qObj.sub_questions = subs.map(sq => ({
          id: sq._id,
          part: sq.part,
          question_type: sq.question_type,
          instruction: sq.instruction,
          question_text: sq.question_text,
          options_json: sq.options_json
        }));
      }
      return qObj;
    });
    
    res.json({
      success: true,
      data: {
        test: {
          id: test._id,
          title: test.title,
          description: test.description,
          category: test.category,
          duration_minutes: test.duration_minutes,
          total_questions: test.total_questions
        },
        questions: questionsForUser,
        examType: 'standard'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - Nộp bài và lưu kết quả
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body;
    const testId = req.params.id;
    const userId = req.user.id;
    
    const questions = await Question.find({ test_id: testId });
    
    let correctCount = 0;
    const detailedAnswers = [];
    
    answers.forEach(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      const isCorrect = question && question.correct_answer === answer.userAnswer;
      if (isCorrect) correctCount++;
      
      detailedAnswers.push({
        question_id: answer.questionId,
        user_answer: answer.userAnswer,
        is_correct: isCorrect
      });
    });
    
    const score = (correctCount / questions.length) * 100;
    
    const result = await UserTestResult.create({
      user_id: userId,
      test_id: testId,
      score: score,
      total_questions: questions.length,
      correct_answers: correctCount,
      wrong_answers: questions.length - correctCount,
      answers: detailedAnswers,
      time_spent: req.body.time_spent || 0
    });
    
    res.json({
      success: true,
      data: {
        score: score,
        correct_answers: correctCount,
        total_questions: questions.length,
        result_id: result._id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - Tạo test mới (admin)
router.post('/', protect, async (req, res) => {
  try {
    const test = await Test.create(req.body);
    res.status(201).json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT - Cập nhật test (admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    res.json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE - Xóa test và các câu hỏi liên quan (admin)
router.delete('/:id', protect, async (req, res) => {
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
});

module.exports = router;