const express = require('express');
const router = express.Router();
const Vocabulary = require('../models/Vocabulary');
const { protect, admin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const vocabularies = await Vocabulary.find().sort({ createdAt: -1 });
    res.json({ success: true, data: vocabularies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    if (!vocabulary) {
      return res.status(404).json({ success: false, message: 'Vocabulary not found' });
    }
    res.json({ success: true, data: vocabulary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const vocabulary = await Vocabulary.create(req.body);
    res.status(201).json({ success: true, data: vocabulary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vocabulary) return res.status(404).json({ success: false, message: 'Vocabulary not found' });
    res.json({ success: true, data: vocabulary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findByIdAndDelete(req.params.id);
    if (!vocabulary) return res.status(404).json({ success: false, message: 'Vocabulary not found' });
    res.json({ success: true, message: 'Vocabulary deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
