const UserTestResult = require('../models/UserTestResult');

// @desc    Lấy thống kê kết quả học tập
// @route   GET /api/results/stats
const getStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Lấy tất cả kết quả của user
    const results = await UserTestResult.find({ user_id: userId });
    
    if (results.length === 0) {
      return res.json({
        success: true,
        data: {
          total_tests: 0,
          average_score: 0,
          highest_score: 0,
          lowest_score: 0,
          total_questions_answered: 0,
          total_correct_answers: 0,
          accuracy_rate: 0,
          level_progress: {}
        }
      });
    }
    
    const totalTests = results.length;
    const scores = results.map(r => r.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / totalTests;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    
    const totalQuestions = results.reduce((sum, r) => sum + r.total_questions, 0);
    const totalCorrect = results.reduce((sum, r) => sum + r.correct_answers, 0);
    const accuracyRate = (totalCorrect / totalQuestions) * 100;
    
    res.json({
      success: true,
      data: {
        total_tests: totalTests,
        average_score: Math.round(averageScore * 100) / 100,
        highest_score: highestScore,
        lowest_score: lowestScore,
        total_questions_answered: totalQuestions,
        total_correct_answers: totalCorrect,
        accuracy_rate: Math.round(accuracyRate * 100) / 100,
        recent_results: results.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getHistory, getResultById, getStatistics };