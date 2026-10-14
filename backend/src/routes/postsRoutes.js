const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');

// GET /api/posts - Fetch all posts
router.get('/', postsController.getAllPosts);

// POST /api/posts - Create new post
router.post('/', postsController.createPost);

// GET /api/posts/:id - Fetch single post
router.get('/:id', postsController.getPostById);

// PUT /api/posts/:id - Full resource update
router.put('/:id', postsController.updatePostPut);

// PATCH /api/posts/:id - Partial resource update
router.patch('/:id', postsController.patchPost);

// DELETE /api/posts/:id - Delete post
router.delete('/:id', postsController.deletePost);

// GET /api/posts/:id/comments - Fetch nested comments for post
router.get('/:id/comments', postsController.getCommentsByPost);

module.exports = router;
