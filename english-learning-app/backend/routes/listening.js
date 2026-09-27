const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getListeningExercises,
  getListeningById,
  createListeningExercise,
  updateListeningExercise,
  deleteListeningExercise
} = require('../controllers/listeningController');
const { protect, admin } = require('../middleware/auth');

// Cấu hình multer - lưu file vào /uploads/audio
const audioDir = path.join(__dirname, '..', 'uploads', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, audioDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.mp3';
    cb(null, uniqueName + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file audio: mp3, wav, ogg, m4a, aac, webm'));
    }
  }
});

// Upload audio file
router.post('/upload', protect, admin, (req, res) => {
  upload.single('audio')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file audio' });
    }
    const url = `/uploads/audio/${req.file.filename}`;
    res.json({ success: true, data: { url, filename: req.file.filename } });
  });
});

// Xoá file audio
router.post('/delete-audio', protect, admin, (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ success: false, message: 'Missing filename' });
  const filePath = path.join(audioDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  res.json({ success: true });
});

router.get('/', getListeningExercises);
router.get('/:id', getListeningById);
router.post('/', protect, admin, createListeningExercise);
router.put('/:id', protect, admin, updateListeningExercise);
router.delete('/:id', protect, admin, deleteListeningExercise);

module.exports = router;