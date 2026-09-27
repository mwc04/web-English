const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const listeningRoutes = require('./routes/listening');
const writingRoutes = require('./routes/writing');
const chatRoutes = require('./routes/chat');
const grammarRoutes = require('./routes/grammar');
const vocabularyRoutes = require('./routes/vocabularies');
const readingRoutes = require('./routes/reading');
const mediaVideoRoutes = require('./routes/mediaVideos');
const learningSessionRoutes = require('./routes/learningSessions');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/results', require('./routes/results'));
app.use('/api/listening', listeningRoutes);
app.use('/api/writing', writingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api/vocabularies', vocabularyRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/reading', readingRoutes);
app.use('/api/media-videos', mediaVideoRoutes);
app.use('/api/transcripts', require('./routes/transcripts'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/gemini', require('./routes/gemini'));
app.use('/api/users', require('./routes/users'));
app.use('/api/user', learningSessionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`\n📚 20 Endpoints đã sẵn sàng:`);
  console.log(`   1. POST   /api/auth/register      - Đăng ký`);
  console.log(`   2. POST   /api/auth/login         - Đăng nhập`);
  console.log(`   3. GET    /api/auth/me            - Thông tin user`);
  console.log(`   4. GET    /api/lessons            - DS bài học`);
  console.log(`   5. GET    /api/lessons/:id        - Chi tiết bài học`);
  console.log(`   6. POST   /api/lessons            - Tạo bài học (Admin)`);
  console.log(`   7. PUT    /api/lessons/:id        - Cập nhật bài học (Admin)`);
  console.log(`   8. DELETE /api/lessons/:id        - Xóa bài học (Admin)`);
  console.log(`   9. GET    /api/tests              - DS bài kiểm tra`);
  console.log(`  10. GET    /api/tests/:id/questions - Lấy câu hỏi`);
  console.log(`  11. POST   /api/tests/:id/submit   - Nộp bài`);
  console.log(`  12. GET    /api/results/history    - Lịch sử kết quả`);
  console.log(`  13. GET    /api/grammar            - DS ngữ pháp`);
  console.log(`  10. GET    /api/vocabularies       - DS từ vựng`);
  console.log(`  11. GET    /api/readings           - DS bài đọc`);
  console.log(`  11. GET    /api/readings/:id       - Chi tiết bài đọc`);
  console.log(`  12. POST   /api/readings           - Tạo bài đọc (Admin)`);
  console.log(`  12. PUT    /api/readings/:id       - Cập nhật bài đọc (Admin)`);
  console.log(`  13. DELETE /api/readings/:id       - Xóa bài đọc (Admin)`);
  console.log(`  14. POST   /api/chat/message       - Chat AI`);
  console.log(`  15. GET    /api/users              - DS người dùng (Admin)`);
  console.log(`  16. POST   /api/user/learning-sessions/start - Bắt đầu session học`);
  console.log(`  17. POST   /api/user/learning-sessions/end   - Kết thúc session học`);
  console.log(`  18. GET    /api/user/learning-stats        - Thống kê học tập`);
});