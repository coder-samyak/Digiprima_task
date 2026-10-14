# 🚀 Posts & Authentication REST API Backend

A production-grade, modular Node.js & Express REST API designed for the React Native mobile application. Built with an industry-standard MVC architecture, JWT authentication, bcryptjs password hashing, and complete CRUD functionality for posts and comments.

---

## 📁 Architecture & Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── index.js             # Environment variables & constants
│   ├── data/
│   │   └── db.js                # In-memory storage & seed data (JSONPlaceholder format)
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT Bearer token authentication guard
│   │   ├── loggerMiddleware.js  # Real-time request logger (Method, URL, Status, ms)
│   │   └── errorMiddleware.js   # 404 handler and central 500 error handler
│   ├── controllers/
│   │   ├── authController.js    # Registration, Login, Profile retrieval
│   │   └── postsController.js   # Full CRUD for posts and comments
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth endpoints
│   │   ├── postsRoutes.js       # /api/posts endpoints
│   │   └── commentsRoutes.js    # /api/comments query endpoints
│   └── app.js                   # Express application setup & middleware assembly
├── .env                         # Local environment variables
├── .env.example                 # Template for environment configuration
├── .gitignore                   # Git ignore file for backend
├── package.json                 # Project manifest & dependencies
├── README.md                    # Backend documentation
└── server.js                    # Server entry point
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
A default `.env` is already provided. If creating a new one:
```bash
cp .env.example .env
```

### 3. Run the Server
```bash
# Standard run
npm start

# Development mode (with auto-reload on Node 18+)
npm run dev
```

The server binds to `0.0.0.0:5000`, making it accessible both locally (`http://localhost:5000`) and across your local Wi-Fi network for mobile devices (`http://192.168.1.63:5000`).

---

## 📋 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user account | ❌ No |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | ❌ No |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile |  Bearer Token |

#### Default Test Account
- **Email:** `demo@example.com`
- **Password:** `password123`

---

### 📝 Posts Management (`/api/posts`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/posts` | Fetch all posts |
| `GET` | `/api/posts/:id` | Fetch a single post by ID |
| `POST` | `/api/posts` | Create a new post |
| `PUT` | `/api/posts/:id` | Full resource replacement (requires title & body) |
| `PATCH` | `/api/posts/:id` | Partial update (updates only provided fields) |
| `DELETE` | `/api/posts/:id` | Delete a post by ID |
| `GET` | `/api/posts/:id/comments` | Fetch comments for a specific post (nested endpoint) |

---

### 💬 Comments (`/api/comments`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/comments?postId=:id` | Fetch comments filtered by query parameter |

---

### 🩺 Health Check
- `GET /api/health` or `GET /` — Returns server status, current timestamp, and registered endpoints.

---

## 🧪 Testing with cURL

### 1. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

### 2. Fetch Posts
```bash
curl -X GET http://localhost:5000/api/posts
```

### 3. Create a Post
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Post","body":"This is a test post body","userId":1}'
```

### 4. Update Post (PUT)
```bash
curl -X PUT http://localhost:5000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","body":"Updated Body Content"}'
```

### 5. Partial Update (PATCH)
```bash
curl -X PATCH http://localhost:5000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Patched Title Only"}'
```

### 6. Delete Post
```bash
curl -X DELETE http://localhost:5000/api/posts/1
```
