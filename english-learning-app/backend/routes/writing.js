const express = require('express');
const router = express.Router();
const {
  getWritingExercises,
  getWritingById,
  createWritingExercise,
  updateWritingExercise,
  deleteWritingExercise
} = require('../controllers/writingController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getWritingExercises);
router.get('/:id', getWritingById);
router.post('/', protect, admin, createWritingExercise);
router.put('/:id', protect, admin, updateWritingExercise);
router.delete('/:id', protect, admin, deleteWritingExercise);

module.exports = router;