import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Post,
  Comment,
  PostsState,
  CreatePostDto,
  UpdatePostDto,
  PatchPostDto,
} from '../../types/post.types';
import { postsApi } from '../../api/postsApi';
import {
  getDeletedPostIds,
  saveDeletedPostId,
  getCreatedPosts,
  saveCreatedPost,
  getUpdatedPosts,
  saveUpdatedPost,
} from '../../utils/storage';

const initialState: PostsState = {
  posts: [],
  currentPost: null,
  comments: [],
  isLoadingPosts: false,
  isRefreshingPosts: false,
  isLoadingCurrentPost: false,
  isLoadingComments: false,
  isSubmittingPost: false,
  isDeletingPost: false,
  postsError: null,
  currentPostError: null,
  commentsError: null,
  actionError: null,
  searchQuery: '',
  lastApiCall: null,
};

/**
 * 1. Fetch all posts (GET /posts)
 * Applies local deletions, edits, and creations so refresh never reverts user actions
 */
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (isRefresh: boolean | undefined, { rejectWithValue }) => {
    try {
      const serverPosts = await postsApi.getAllPosts();
      const deletedIds = await getDeletedPostIds();
      const createdPosts = await getCreatedPosts();
      const updatedMap = await getUpdatedPosts();

      // 1. Filter out posts that user has deleted
      let filtered = serverPosts.filter((p) => !deletedIds.includes(p.id));

      // 2. Apply any updates made by user
      filtered = filtered.map((p) => updatedMap[p.id] || p);

      // 3. Prepend any created posts that haven't been deleted
      const activeCreated = createdPosts.filter((p) => !deletedIds.includes(p.id));
      const combined = [...activeCreated, ...filtered];

      return { posts: combined, isRefresh: !!isRefresh };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch posts');
    }
  }
);

/**
 * 2. Fetch single post (GET /posts/:id)
 */
export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (postId: number, { rejectWithValue }) => {
    try {
      const deletedIds = await getDeletedPostIds();
      if (deletedIds.includes(postId)) {
        return rejectWithValue(`Post #${postId} has been deleted.`);
      }
      const updatedMap = await getUpdatedPosts();
      if (updatedMap[postId]) {
        return updatedMap[postId];
      }
      const created = await getCreatedPosts();
      const localCreated = created.find((p) => p.id === postId);
      if (localCreated) {
        return localCreated;
      }
      const data = await postsApi.getPostById(postId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || `Failed to fetch post #${postId}`);
    }
  }
);

/**
 * 3 & 4. Fetch comments (supports /posts/:id/comments or /comments?postId=:id)
 */
export const fetchComments = createAsyncThunk(
  'posts/fetchComments',
  async (
    payload: { postId: number; useQueryParam?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const data = payload.useQueryParam
        ? await postsApi.getCommentsByQueryParam(payload.postId)
        : await postsApi.getCommentsByPostId(payload.postId);
      return { comments: data, endpointUsed: payload.useQueryParam ? 'query' : 'nested' };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch comments');
    }
  }
);

/**
 * 5. Create new post (POST /posts)
 * Persists in local storage so it NEVER disappears on refresh
 */
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (dto: CreatePostDto, { rejectWithValue, getState }) => {
    try {
      const createdPost = await postsApi.createPost(dto);
      
      const state = getState() as { posts: PostsState };
      const maxId = state.posts.posts.reduce((max, p) => Math.max(max, p.id), 100);
      const postWithUniqueId: Post = {
        ...createdPost,
        id: maxId + 1,
      };

      // Persist in local storage
      await saveCreatedPost(postWithUniqueId);

      return postWithUniqueId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create post');
    }
  }
);

/**
 * 6. Full update post (PUT /posts/:id)
 * Persists in storage so full replacement stays on refresh
 */
export const updatePostPut = createAsyncThunk(
  'posts/updatePostPut',
  async (dto: UpdatePostDto, { rejectWithValue }) => {
    try {
      const updatedPost = await postsApi.updatePostPut(dto.id, dto);
      await saveUpdatedPost(updatedPost);
      return updatedPost;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update post via PUT');
    }
  }
);

/**
 * 7. Partial update post (PATCH /posts/:id)
 * Persists in storage so patch stays on refresh
 */
export const patchPost = createAsyncThunk(
  'posts/patchPost',
  async (dto: PatchPostDto, { rejectWithValue, getState }) => {
    try {
      const result = await postsApi.patchPost(dto.id, dto);
      
      const state = getState() as { posts: PostsState };
      const existing = state.posts.posts.find((p) => p.id === dto.id) || state.posts.currentPost;
      
      const mergedPost: Post = {
        id: dto.id,
        userId: dto.userId ?? (existing ? existing.userId : 1),
        title: dto.title ?? (existing ? existing.title : result.title),
        body: dto.body ?? (existing ? existing.body : result.body),
      };

      await saveUpdatedPost(mergedPost);

      return mergedPost;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to patch post via PATCH');
    }
  }
);

/**
 * 8. Delete post (DELETE /posts/:id)
 * Saves deleted ID so post NEVER returns on refresh
 */
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId: number, { rejectWithValue }) => {
    try {
      await postsApi.deletePost(postId);
      // Persist deletion
      await saveDeletedPostId(postId);
      return postId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete post');
    }
  }
);

export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.comments = [];
      state.currentPostError = null;
      state.commentsError = null;
    },
    clearActionError: (state) => {
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch Posts
    builder.addCase(fetchPosts.pending, (state, action) => {
      if (action.meta.arg) {
        state.isRefreshingPosts = true;
      } else {
        state.isLoadingPosts = true;
      }
      state.postsError = null;
    });
    builder.addCase(fetchPosts.fulfilled, (state, action) => {
      state.isLoadingPosts = false;
      state.isRefreshingPosts = false;
      state.posts = action.payload.posts;
      state.lastApiCall = {
        method: 'GET',
        endpoint: '/posts',
        status: 200,
        timestamp: new Date().toLocaleTimeString(),
      };
    });
    builder.addCase(fetchPosts.rejected, (state, action) => {
      state.isLoadingPosts = false;
      state.isRefreshingPosts = false;
      state.postsError = action.payload as string;
    });

    // 2. Fetch Post By ID
    builder.addCase(fetchPostById.pending, (state) => {
      state.isLoadingCurrentPost = true;
      state.currentPostError = null;
    });
    builder.addCase(fetchPostById.fulfilled, (state, action) => {
      state.isLoadingCurrentPost = false;
      state.currentPost = action.payload;
      state.lastApiCall = {
        method: 'GET',
        endpoint: `/posts/${action.payload.id}`,
        status: 200,
        timestamp: new Date().toLocaleTimeString(),
      };
    });
    builder.addCase(fetchPostById.rejected, (state, action) => {
      state.isLoadingCurrentPost = false;
      state.currentPostError = action.payload as string;
    });

    // 3 & 4. Fetch Comments
    builder.addCase(fetchComments.pending, (state) => {
      state.isLoadingComments = true;
      state.commentsError = null;
    });
    builder.addCase(fetchComments.fulfilled, (state, action) => {
      state.isLoadingComments = false;
      state.comments = action.payload.comments;
      state.lastApiCall = {
        method: 'GET',
        endpoint:
          action.payload.endpointUsed === 'query'
            ? `/comments?postId=${action.meta.arg.postId}`
            : `/posts/${action.meta.arg.postId}/comments`,
        status: 200,
        timestamp: new Date().toLocaleTimeString(),
      };
    });
    builder.addCase(fetchComments.rejected, (state, action) => {
      state.isLoadingComments = false;
      state.commentsError = action.payload as string;
    });

    // 5. Create Post
    builder.addCase(createPost.pending, (state) => {
      state.isSubmittingPost = true;
      state.actionError = null;
    });
    builder.addCase(createPost.fulfilled, (state, action) => {
      state.isSubmittingPost = false;
      // Prepend to posts list so user sees their new post immediately
      state.posts.unshift(action.payload);
      state.lastApiCall = {
        method: 'POST',
        endpoint: '/posts',
        status: 201,
        timestamp: new Date().toLocaleTimeString(),
      };
    });
    builder.addCase(createPost.rejected, (state, action) => {
      state.isSubmittingPost = false;
      state.actionError = action.payload as string;
    });

    // 6. PUT Update Post
    builder.addCase(updatePostPut.pending, (state) => {
      state.isSubmittingPost = true;
      state.actionError = null;
    });
    builder.addCase(updatePostPut.fulfilled, (state, action) => {
      state.isSubmittingPost = false;
      // Update in posts list
      const index = state.posts.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
      // Update current post if matching
      if (state.currentPost?.id === action.payload.id) {
        state.currentPost = action.payload;
      }
      state.lastApiCall = {
        method: 'PUT',
        endpoint: `/posts/${action.payload.id}`,
        status: 200,
        timestamp: new Date().toLocaleTimeString(),
      };
    });
    builder.addCase(updatePostPut.rejected, (state, action) => {
      state.isSubmittingPost = false;
      state.actionError = action.payload as string;
    });

    // 7. PATCH Post
    builder.addCase(patchPost.pending, (state) => {
      state.isSubmittingPost = true;
      state.actionError = null;
    });
    builder.addCase(patchPost.fulfilled, (state, action) => {
      state.isSubmittingPost = false;
      // Update in posts list
      const index = state.posts.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
      // Update current post if matching
      if (state.currentPost?.id === action.payload.id) {
        state.currentPost = action.payload;
      }
      state.lastApiCall = {
        method: 'PATCH',
        endpoint: `/posts/${action.payload.id}`,
        status: 200,
        timestamp: new Date().toLocaleTimeString(),
      };
    });
    builder.addCase(patchPost.rejected, (state, action) => {
      state.isSubmittingPost = false;
      state.actionError = action.payload as string;
    });

    // 8. DELETE Post
    builder.addCase(deletePost.pending, (state) => {
      state.isDeletingPost = true;
      state.actionError = null;
    });
    builder.addCase(deletePost.fulfilled, (state, action) => {
      state.isDeletingPost = false;
      const deletedId = action.payload;
      state.posts = state.posts.filter((p) => p.id !== deletedId);
      if (state.currentPost?.id === deletedId) {
        state.currentPost = null;
      }
      state.lastApiCall = {
        method: 'DELETE',
        endpoint: `/posts/${deletedId}`,
        status: 200,
        timestamp: new Date().toLocaleTimeString(),
      };
    });
    builder.addCase(deletePost.rejected, (state, action) => {
      state.isDeletingPost = false;
      state.actionError = action.payload as string;
    });
  },
});

export const { setSearchQuery, clearCurrentPost, clearActionError } =
  postsSlice.actions;
export default postsSlice.reducer;
