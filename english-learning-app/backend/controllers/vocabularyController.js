const { Vocabulary } = require('../models');

// @desc    Get all vocabularies
const getVocabularies = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const vocabularies = await Vocabulary.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Vocabulary.countDocuments(query);
    
    res.json({
      success: true,
      data: vocabularies,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single vocabulary
const getVocabularyById = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    if (!vocabulary) {
      return res.status(404).json({ success: false, message: 'Vocabulary not found' });
    }
    res.json({ success: true, data: vocabulary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create vocabulary
const createVocabulary = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.create(req.body);
    res.status(201).json({ success: true, data: vocabulary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update vocabulary
const updateVocabulary = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!vocabulary) {
      return res.status(404).json({ success: false, message: 'Vocabulary not found' });
    }
    res.json({ success: true, data: vocabulary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete vocabulary
const deleteVocabulary = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findByIdAndDelete(req.params.id);
    if (!vocabulary) {
      return res.status(404).json({ success: false, message: 'Vocabulary not found' });
    }
    res.json({ success: true, message: 'Vocabulary deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export tất cả các function
module.exports = {
  getVocabularies,
  getVocabularyById,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary
};