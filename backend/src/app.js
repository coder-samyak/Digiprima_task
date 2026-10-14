const express = require('express');
const cors = require('cors');
const { requestLogger } = require('./middleware/loggerMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const postsRoutes = require('./routes/postsRoutes');
const commentsRoutes = require('./routes/commentsRoutes');

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health Check & Root Info
app.get(['/', '/api/health'], (req, res) => {
  return res.status(200).json({
    status: 'ONLINE',
    service: 'Mobile Posts & Auth Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: [
        'POST /api/auth/signup',
        'POST /api/auth/login',
        'GET /api/auth/me (Protected)',
      ],
      posts: [
        'GET /api/posts',
        'GET /api/posts/:id',
        'POST /api/posts',
        'PUT /api/posts/:id',
        'PATCH /api/posts/:id',
        'DELETE /api/posts/:id',
        'GET /api/posts/:id/comments',
      ],
      comments: ['GET /api/comments?postId=:id'],
    },
  });
});

// Mount Feature API Routers
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);

// 404 & Central Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
