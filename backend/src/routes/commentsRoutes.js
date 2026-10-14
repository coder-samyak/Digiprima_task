const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');

// GET /api/comments?postId=:id - Fetch comments with query param
router.get('/', postsController.getCommentsQuery);

module.exports = router;
