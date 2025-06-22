const express = require('express');
const router = express.Router();
const { llmSearch } = require('../services/llmSearchService');

// Only use GET method with query parameters
router.get('/', llmSearch);

module.exports = router;
