import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Comment } from '../../types/post.types';
import { postsApi } from '../../api/postsApi';

export interface CommentsState {
  comments: Comment[];
  isLoadingComments: boolean;
  commentsError: string | null;
  lastFetchedPostId: number | null;
  endpointUsed: 'nested' | 'query' | null;
  lastApiCall: {
    method: 'GET';
    endpoint: string;
    status: number;
    timestamp: string;
  } | null;
}

const initialState: CommentsState = {
  comments: [],
  isLoadingComments: false,
  commentsError: null,
  lastFetchedPostId: null,
  endpointUsed: null,
  lastApiCall: null,
};

/**
 * Async Thunk to fetch comments for a selected post
 * Demonstrates both:
 * 1. GET /posts/:id/comments (nested route)
 * 2. GET /comments?postId=:id (query parameter)
 */
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (
    payload: { postId: number; useQueryParam?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const data = payload.useQueryParam
        ? await postsApi.getCommentsByQueryParam(payload.postId)
        : await postsApi.getCommentsByPostId(payload.postId);

      return {
        comments: data,
        postId: payload.postId,
        endpointUsed: (payload.useQueryParam ? 'query' : 'nested') as 'nested' | 'query',
      };
    } catch (error: any) {
      return rejectWithValue(
        error.message || `Failed to fetch comments for post #${payload.postId}`
      );
    }
  }
);

export const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
      state.commentsError = null;
      state.lastFetchedPostId = null;
      state.endpointUsed = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchComments.pending, (state) => {
      state.isLoadingComments = true;
      state.commentsError = null;
    });
    builder.addCase(fetchComments.fulfilled, (state, action) => {
      state.isLoadingComments = false;
      state.comments = action.payload.comments;
      state.lastFetchedPostId = action.payload.postId;
      state.endpointUsed = action.payload.endpointUsed;
      state.commentsError = null;
      state.lastApiCall = {
        method: 'GET',
        endpoint:
          action.payload.endpointUsed === 'query'
            ? `/comments?postId=${action.payload.postId}`
            : `/posts/${action.payload.postId}/comments`,
        status: 200,
        timestamp: new Date().toLocaleTimeString(),
      };
    });
    builder.addCase(fetchComments.rejected, (state, action) => {
      state.isLoadingComments = false;
      state.commentsError = action.payload as string;
    });
  },
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;
