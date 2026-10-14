const { posts, comments } = require('../data/db');

/**
 * Posts Controller
 * Handles full CRUD operations on posts and associated comments.
 */

// 1. GET /api/posts (Fetch all posts)
const getAllPosts = (req, res) => {
  return res.status(200).json(posts);
};

// 2. GET /api/posts/:id (Fetch single post by ID)
const getPostById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return res.status(404).json({ message: `Post with ID ${id} not found.` });
  }

  return res.status(200).json(post);
};

// 3. GET /api/posts/:id/comments (Fetch nested comments for a post)
const getCommentsByPost = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const postComments = comments.filter((c) => c.postId === id);
  return res.status(200).json(postComments);
};

// 4. GET /api/comments?postId=:id (Fetch comments with query parameter)
const getCommentsQuery = (req, res) => {
  const { postId } = req.query;
  if (postId) {
    const id = parseInt(postId, 10);
    const postComments = comments.filter((c) => c.postId === id);
    return res.status(200).json(postComments);
  }
  return res.status(200).json(comments);
};

// 5. POST /api/posts (Create new post)
const createPost = (req, res) => {
  const { title, body, userId } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ message: 'Title is required.' });
  }
  if (!body || body.trim().length === 0) {
    return res.status(400).json({ message: 'Body content is required.' });
  }

  const maxId = posts.reduce((max, p) => Math.max(max, p.id), 0);
  const newPost = {
    id: maxId + 1,
    title: title.trim(),
    body: body.trim(),
    userId: userId || 1,
  };

  posts.unshift(newPost);
  return res.status(201).json(newPost);
};

// 6. PUT /api/posts/:id (Full resource update)
const updatePostPut = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, body, userId } = req.body;

  const postIndex = posts.findIndex((p) => p.id === id);
  if (postIndex === -1) {
    return res.status(404).json({ message: `Post with ID ${id} not found.` });
  }

  if (!title || !body) {
    return res.status(400).json({ message: 'PUT requires all fields: title and body.' });
  }

  const updatedPost = {
    id,
    title: title.trim(),
    body: body.trim(),
    userId: userId !== undefined ? userId : posts[postIndex].userId,
  };

  posts[postIndex] = updatedPost;
  return res.status(200).json(updatedPost);
};

// 7. PATCH /api/posts/:id (Partial resource update)
const patchPost = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const postIndex = posts.findIndex((p) => p.id === id);

  if (postIndex === -1) {
    return res.status(404).json({ message: `Post with ID ${id} not found.` });
  }

  const existing = posts[postIndex];
  const { title, body, userId } = req.body;

  const patchedPost = {
    ...existing,
    ...(title !== undefined ? { title: title.trim() } : {}),
    ...(body !== undefined ? { body: body.trim() } : {}),
    ...(userId !== undefined ? { userId } : {}),
  };

  posts[postIndex] = patchedPost;
  return res.status(200).json(patchedPost);
};

// 8. DELETE /api/posts/:id (Delete post)
const deletePost = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const postIndex = posts.findIndex((p) => p.id === id);

  if (postIndex === -1) {
    return res.status(404).json({ message: `Post with ID ${id} not found.` });
  }

  posts.splice(postIndex, 1);
  return res.status(200).json({ message: `Post #${id} deleted successfully.`, id });
};

module.exports = {
  getAllPosts,
  getPostById,
  getCommentsByPost,
  getCommentsQuery,
  createPost,
  updatePostPut,
  patchPost,
  deletePost,
};
