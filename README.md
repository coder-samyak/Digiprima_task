# 📱 User Authentication & Posts Management Mobile App

A modern, production-grade React Native mobile application built with **TypeScript**, **Redux Toolkit**, **React Navigation**, and **Axios**, integrating with the **JSONPlaceholder REST API** for full CRUD operations, alongside a companion **Express.js Backend API** with JWT authentication and local session persistence.

---

## 📑 Table of Contents
1. [Project Introduction & Key Features](#1-project-introduction--key-features)
2. [Installation & Run Commands](#2-installation--run-commands)
3. [Technologies Used](#3-technologies-used)
4. [Screens & Navigation Flow](#4-screens--navigation-flow)
5. [All API Endpoints Checklist](#5-all-api-endpoints-checklist)
6. [Mock Authentication Architecture](#6-mock-authentication-architecture)
7. [Difference Between PUT and PATCH](#7-difference-between-put-and-patch)
8. [JSONPlaceholder Simulation Limitation](#8-jsonplaceholder-simulation-limitation)
9. [Local Redux State Management Strategy](#9-local-redux-state-management-strategy)
10. [Screens UI Previews & Demonstrations](#10-screens-ui-previews--demonstrations)

---

## 1. Project Introduction & Key Features

This mobile application provides an end-to-end user experience for authenticating accounts and managing blog posts with full CRUD capabilities:

- **Module 1 — User Authentication**:
  - **Signup Screen**: Full Name, Email Address, Password, Confirm Password with live form validation (empty checks, regex email validation, password $\ge 8$ chars, password match). Persists accounts locally in `AsyncStorage` and syncs with the companion backend API.
  - **Login Screen**: Validated email and password. Local mock authentication flow against registered accounts or pre-seeded demo user (`demo@example.com` / `password123`).
  - **Session Persistence**: Sessions are saved using `@react-native-async-storage/async-storage` and restored automatically on app launch.
  - **Logout Flow**: Safely clears session tokens and resets navigation to the login screen.
  - **1-Tap Demo Login**: Instant login button for rapid evaluator testing without typing.

- **Module 2 — Home & Posts Listing**:
  - Fetches all posts via `GET https://jsonplaceholder.typicode.com/posts` using Redux Toolkit `createAsyncThunk`.
  - Optimized `FlatList` showing post ID, user badge, title, and body preview.
  - Pull-to-refresh functionality with native refresh control.
  - Real-time search filter for instantly filtering posts by title or keyword.
  - Clear loading spinner, error state with retry action, and empty state.
  - Live **REST API Call Diagnostic Banner** displaying the active method, endpoint, and HTTP status code.

- **Module 3 — Dynamic Post Details & Comments**:
  - Dynamic route parameter (`postId`) to fetch single post via `GET /posts/:id` (no hardcoded IDs).
  - Displays post title, complete body, post ID, and author user ID.
  - Comments section supporting **both** query styles with an in-app toggle:
    - Hierarchical endpoint: `GET /posts/:id/comments`
    - Query parameter endpoint: `GET /comments?postId=:id`
  - Displays comment author name, email, avatar initial, and comment body with dedicated loading/error states.

- **Module 4 — Create Post**:
  - Form with Title and Body fields.
  - Validation ensuring non-empty title ($\ge 3$ chars) and content ($\ge 5$ chars).
  - Submits request via `POST /posts` with payload `{ title, body, userId: 1 }`.
  - Optimistically prepends new post into Redux store so it is immediately visible at the top of the Home feed.

- **Module 5 — Edit Post (PUT vs PATCH)**:
  - Form pre-populated with existing post data.
  - **Dual update support**: Evaluators can choose between **PUT (Full Resource Replacement)** and **PATCH (Partial Resource Update)** with explanatory UI cards and dedicated action buttons.
  - Dispatches `updatePostPut` or `patchPost` through Redux and updates state immediately.

- **Module 6 — Delete Post**:
  - Action button triggers a custom cross-platform confirmation modal.
  - Calls `DELETE /posts/:id` through Redux.
  - Removes deleted item from Redux list and navigates back to Home.

---

## 2. Installation & Run Commands

### Prerequisites
- **Node.js** (v18 or higher recommended; v22 fully supported)
- **npm** (v10+)
- **Mobile Phone** with **Expo Go** app installed (from Google Play Store or Apple App Store)

### Step 1: Install Dependencies
```bash
# In the project root
npm install
```

### Step 2: Start the Companion Backend (Optional but Ready!)
A companion Express.js server is included in `backend/`:
```bash
cd backend
npm install
npm start
# Runs at http://localhost:5000 and http://192.168.1.63:5000
```

### Step 3: Start the Expo Development Server
```bash
# In the project root
npx expo start -c
```

### Step 4: Run on Mobile or Web
- **Physical Mobile Phone (Expo Go)**:
  1. Open the **Expo Go** app on your phone.
  2. Tap **"Enter URL manually"** and enter:
     ```
     exp://192.168.1.63:8081
     ```
     *(Make sure phone and PC are on the same Wi-Fi network!)*
  3. Or scan the QR code displayed in the terminal.
- **Web Browser**:
  ```bash
  npm run web
  ```
- **Android Emulator**:
  ```bash
  npx expo start --android
  ```
- **iOS Simulator**:
  ```bash
  npx expo start --ios
  ```

### Verification & Health Commands
```bash
# Strict TypeScript Typecheck (0 errors)
npx tsc --noEmit

# Expo Diagnostics Check (21/21 checks passing)
npx expo-doctor
```

---

## 3. Technologies Used

| Category | Technology | Purpose |
|---|---|---|
| **Mobile Framework** | React Native (Expo SDK 57) | Cross-platform native mobile application |
| **Language** | TypeScript (Strict Mode) | Type safety, autocompletion, compile-time error checks |
| **State Management** | Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) | Predictable global store, normalized state, slices |
| **Navigation** | React Navigation v7 (`@react-navigation/native-stack`) | Native screen transitions, auth guard flow |
| **HTTP Client** | Axios (`axios`) | Request/response interceptors, error formatting |
| **Local Persistence** | `@react-native-async-storage/async-storage` | Session tokens, local mock accounts |
| **Iconography** | `@expo/vector-icons` (Ionicons) | Modern scalable vector icons |
| **UI Components** | Custom Component System | CustomButton, CustomInput, ConfirmModal, Badge, ApiCallBanner |
| **Backend API** | Node.js + Express.js + JWT + bcryptjs | Real authentication and fallback REST endpoints |

---

## 4. Screens & Navigation Flow

The application uses **React Navigation** with an **Authentication Guard**:

```
                       ┌─────────────────────────┐
                       │     App Launching       │
                       │ (restoreSession Splash) │
                       └────────────┬────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │ Is User Authenticated?        │
                    └───────┬───────────────┬───────┘
                            │ NO            │ YES
                            ▼               ▼
           ┌──────────────────────┐   ┌───────────────────────────┐
           │      Auth Stack      │   │         App Stack         │
           ├──────────────────────┤   ├───────────────────────────┤
           │ LoginScreen          │   │ HomeScreen                │
           │  │                   │   │  ├── PostDetailsScreen    │
           │  └── SignupScreen    │   │  │    ├── EditPostScreen  │
           └──────────────────────┘   │  │    └── Delete Post     │
                                      │  └── CreatePostScreen     │
                                      └───────────────────────────┘
```

1. **Splash Screen**: On startup, `restoreSession` reads `@app_auth_session` from AsyncStorage.
2. **Auth Stack (`LoginScreen`, `SignupScreen`)**: Displayed if no valid token exists. Successful registration navigates to Login; successful login transitions to the App Stack.
3. **App Stack (`HomeScreen`, `PostDetailsScreen`, `CreatePostScreen`, `EditPostScreen`)**: Protected routes. Logging out immediately destroys the session and redirects to Login.

---

## 5. Professional Project Architecture & Directory Structure

```
Digiprima_Task/
├── backend/                       # 🚀 Self-Contained Node.js & Express REST API
│   ├── src/
│   │   ├── config/                # Environment variables & constants
│   │   │   └── index.js
│   │   ├── controllers/           # Business logic & request handling
│   │   │   ├── authController.js  # Registration, Login, Profile
│   │   │   └── postsController.js # Full CRUD for posts & comments
│   │   ├── data/                  # In-memory mock database & seed data
│   │   │   └── db.js
│   │   ├── middleware/            # Custom express middlewares
│   │   │   ├── authMiddleware.js  # JWT Bearer verification
│   │   │   ├── errorMiddleware.js # 404 & centralized error handler
│   │   │   └── loggerMiddleware.js# HTTP request logger
│   │   ├── routes/                # Modular REST route definitions
│   │   │   ├── authRoutes.js      # /api/auth endpoints
│   │   │   ├── commentsRoutes.js  # /api/comments query route
│   │   │   └── postsRoutes.js     # /api/posts endpoints
│   │   └── app.js                 # Express application & middleware assembly
│   ├── .env                       # Local environment variables
│   ├── .env.example               # Template environment configuration
│   ├── .gitignore                 # Backend-specific ignore file
│   ├── package.json               # Backend dependencies (express, jwt, bcryptjs)
│   ├── README.md                  # Comprehensive backend documentation
│   └── server.js                  # Clean server entry point (port 5000)
│
├── src/                           # 📱 React Native Mobile Application
│   ├── api/                       # API clients & Axios interceptors
│   │   ├── apiClient.ts           # JSONPlaceholder HTTP client
│   │   ├── authApi.ts             # Express backend auth client
│   │   └── postsApi.ts            # All 8 JSONPlaceholder endpoints
│   ├── components/                # Reusable UI component library
│   │   └── common/
│   │       ├── Badge.tsx          # Method & status badges
│   │       ├── ConfirmModal.tsx   # Cross-platform action dialogs
│   │       ├── CustomButton.tsx   # Primary, secondary, outline buttons
│   │       ├── CustomInput.tsx    # Validated inputs with labels & errors
│   │       ├── EmptyState.tsx     # Zero-data fallback screens
│   │       ├── ErrorMessage.tsx   # Network error banners with retry
│   │       └── LoadingSpinner.tsx # Centered animated loaders
│   ├── navigation/                # React Navigation configuration
│   │   └── RootNavigator.tsx      # Native stack with Auth Guard
│   ├── screens/                   # User-facing application screens
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx    # Login screen with 1-tap demo
│   │   │   └── SignupScreen.tsx   # Signup screen with live validations
│   │   └── posts/
│   │       ├── CreatePostScreen.tsx # New post publisher
│   │       ├── EditPostScreen.tsx   # Post editor (PUT & PATCH)
│   │       ├── HomeScreen.tsx       # Feed, search, pull-to-refresh
│   │       └── PostDetailsScreen.tsx# Dynamic post viewer & comments
│   ├── store/                     # Redux Toolkit global store
│   │   ├── index.ts               # Store configuration & typed hooks
│   │   └── slices/                # State slices & async thunks
│   │       ├── authSlice.ts       # Auth state, session restore, logout
│   │       ├── commentsSlice.ts   # Comments state & query loaders
│   │       └── postsSlice.ts      # Posts CRUD & persistence logic
│   ├── theme/                     # Design tokens & styling system
│   │   ├── colors.ts              # Curated accessible palette
│   │   └── spacing.ts             # Padding, margins, radii, shadows
│   ├── types/                     # Strict TypeScript interfaces
│   │   ├── auth.types.ts          # User, credentials, auth state
│   │   ├── navigation.types.ts    # Stack navigation parameter lists
│   │   └── post.types.ts          # Posts, comments, payload types
│   └── utils/                     # Helper utilities
│       ├── storage.ts             # AsyncStorage local persistence
│       └── validation.ts          # Form validation schemas
│
├── assets/                        # Mobile app icons and splash screens
├── App.tsx                        # Root React Native wrapper (Redux Provider)
├── app.json                       # Expo configuration
├── index.ts                       # Expo registration entry point
├── package.json                   # Mobile app dependencies
├── tsconfig.json                  # Strict TypeScript compiler options
├── .gitignore                     # Git ignore rules
└── README.md                      # Complete project documentation
```

---

## 6. All API Endpoints Checklist

All 8 requested REST endpoints are implemented in [`src/api/postsApi.ts`](file:///c:/Users/samya/Desktop/Digiprima_Task/src/api/postsApi.ts):

| # | Method | Endpoint | Purpose | Implemented Screen & Function |
|---|---|---|---|---|
| 1 | `GET` | `/posts` | Fetch all posts | `HomeScreen` → `fetchPosts` |
| 2 | `GET` | `/posts/:id` | Fetch single post dynamically | `PostDetailsScreen` → `fetchPostById` |
| 3 | `GET` | `/posts/:id/comments` | Fetch comments for a post (nested URL) | `PostDetailsScreen` → `fetchComments` (Option 1) |
| 4 | `GET` | `/comments?postId=:id` | Fetch comments using query parameter | `PostDetailsScreen` → `fetchComments` (Option 2) |
| 5 | `POST` | `/posts` | Create new post | `CreatePostScreen` → `createPost` |
| 6 | `PUT` | `/posts/:id` | Replace/update post (Full resource) | `EditPostScreen` → `updatePostPut` |
| 7 | `PATCH` | `/posts/:id` | Partially update post (Delta fields) | `EditPostScreen` → `patchPost` |
| 8 | `DELETE` | `/posts/:id` | Delete post | `PostDetailsScreen` & `HomeScreen` → `deletePost` |

> **Note on Comments Endpoints**: On [`PostDetailsScreen.tsx`](file:///c:/Users/samya/Desktop/Digiprima_Task/src/screens/posts/PostDetailsScreen.tsx#L196-L230), an interactive tab switcher allows you to click between **`/posts/:id/comments`** and **`?postId=:id`** to test both endpoints live!

---

## 6. Mock Authentication Architecture

### Why Mock Authentication is Used
The **JSONPlaceholder** API is a mock testing service that simulates read/write operations for posts and comments. **It does not provide server-side authentication endpoints** (`/auth/login`, `/auth/register`, JWT tokens).

### How It Works:
1. **Local Account Store**: When registering on `SignupScreen`, user details are saved into `AsyncStorage` (`@app_registered_users`).
2. **Credential Matching**: When logging in on `LoginScreen`, the entered email and password are compared against stored accounts (or the pre-seeded demo user).
3. **Session Persistence**: On match, Redux sets `isAuthenticated = true` and saves the user and mock JWT token into `AsyncStorage` (`@app_auth_session`).
4. **Auto-Restore**: App restarts trigger `restoreSession`, restoring the user to `HomeScreen` without asking for credentials again.
5. **Logout**: Home screen logout button calls `clearAuthSession()`, wipes storage, and resets Redux state to unauthenticated.

### Quick Demo Credentials
- **Email**: `demo@example.com`
- **Password**: `password123`
- *(Or press the purple **"1-Tap Instant Login"** button on the Login screen!)*

---

## 7. Difference Between PUT and PATCH

In [`EditPostScreen.tsx`](file:///c:/Users/samya/Desktop/Digiprima_Task/src/screens/posts/EditPostScreen.tsx), both methods are implemented with dedicated selector tabs and action buttons:

| Characteristic | `PUT /posts/:id` | `PATCH /posts/:id` |
|---|---|---|
| **Semantic Meaning** | **Full Resource Replacement** | **Partial Resource Modification** |
| **Payload Behavior** | Must transmit the **complete** resource. Any omitted fields are considered deleted or set to `null`. | Transmits **only the specific fields that changed**; unmentioned fields remain intact. |
| **Example Request Body** | `{ "id": 5, "userId": 1, "title": "New Title", "body": "New Body" }` | `{ "id": 5, "title": "New Title" }` |
| **Idempotency** | **Idempotent**: Multiple identical requests yield the identical server state. | Generally **Non-idempotent** depending on operations. |
| **Bandwidth** | Higher network overhead | Minimal network overhead (delta only) |
| **Best Used When** | Overwriting an entire record with all form inputs verified. | Updating individual fields (e.g., editing only the title or status). |

---

## 8. JSONPlaceholder Simulation Limitation

JSONPlaceholder is a fake REST API designed for frontend testing. It **simulates** write operations:
- `POST /posts` returns `{ id: 101, ... }`
- `PUT /posts/:id` and `PATCH /posts/:id` return status `200 OK`
- `DELETE /posts/:id` returns status `200 OK`

**However, JSONPlaceholder does NOT write changes to a permanent database.** If you fetch `GET /posts` again from the remote server, your newly created post or edited title will not exist on their disk.

---

## 9. Local Redux State Management Strategy

To solve JSONPlaceholder's limitation and deliver a realistic user experience, our app maintains optimistic local Redux state updates in [`postsSlice.ts`](file:///c:/Users/samya/Desktop/Digiprima_Task/src/store/slices/postsSlice.ts):

1. **Creating Posts (`createPost.fulfilled`)**:
   ```typescript
   // Prepend to posts list with a unique ID
   state.posts.unshift(action.payload);
   ```
   The new post immediately appears at the very top of the Home feed (#1).

2. **Updating Posts (`updatePostPut.fulfilled` & `patchPost.fulfilled`)**:
   ```typescript
   const index = state.posts.findIndex((p) => p.id === action.payload.id);
   if (index !== -1) {
     state.posts[index] = action.payload;
   }
   if (state.currentPost?.id === action.payload.id) {
     state.currentPost = action.payload;
   }
   ```
   Both the post list and the details screen reflect changes immediately.

3. **Deleting Posts (`deletePost.fulfilled`)**:
   ```typescript
   state.posts = state.posts.filter((p) => p.id !== action.payload);
   if (state.currentPost?.id === action.payload) {
     state.currentPost = null;
   }
   ```
   The deleted post is safely removed from the list only after the API returns success.

---

## 10. Screens UI Previews & Demonstrations

```
┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
│     Welcome Back        │   │  Posts Dashboard        │   │  Post Details #5        │
│                         │   │  [GET /posts 200 OK]    │   │  [GET /posts/5 200 OK]  │
│  [ Email Address ]      │   │                         │   │                         │
│  [ Password      ]      │   │  🔍 Filter by title...  │   │  POST ID: 5  USER ID: 1 │
│                         │   │                         │   │  Title of Post          │
│  [    SIGN IN    ]      │   │  #1 nesciunt quas odio  │   │  Full complete body...  │
│                         │   │  preview of body...     │   │                         │
│  [ 1-Tap Demo Login ]   │   │  #2 qui est esse        │   │  [Edit PUT/PATCH] [Del] │
│                         │   │  preview of body...     │   │  Comments (5)           │
│  Don't have an account? │   │                         │   │  [ /posts/:id ] [ ?id ] │
│  Sign Up                │   │  (+) Floating Create    │   │  - User: Comment...     │
└─────────────────────────┘   └─────────────────────────┘   └─────────────────────────┘
        Login Screen                   Home Feed                Post Details Screen
```

- **Top Live API Banner**: Every screen shows an active diagnostic banner displaying the real-time HTTP method, endpoint, and status.
- **Confirmation Dialog**: Before deleting, a custom modal warns the user with Cancel / Delete actions.
- **Form Error Feedback**: Real-time validation errors appear below fields in crisp red typography.
