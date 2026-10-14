import { apiClient } from './apiClient';
import {
  Post,
  Comment,
  CreatePostDto,
  UpdatePostDto,
  PatchPostDto,
} from '../types/post.types';

export const postsApi = {
  /**
   * 1. GET /posts
   * Fetch all posts
   */
  getAllPosts: async (): Promise<Post[]> => {
    const response = await apiClient.get<Post[]>('/posts');
    return response.data;
  },

  /**
   * 2. GET /posts/:id
   * Fetch a single post dynamically
   */
  getPostById: async (postId: number): Promise<Post> => {
    const response = await apiClient.get<Post>(`/posts/${postId}`);
    return response.data;
  },

  /**
   * 3. GET /posts/:id/comments
   * Fetch comments using nested route endpoint
   */
  getCommentsByPostId: async (postId: number): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(`/posts/${postId}/comments`);
    return response.data;
  },

  /**
   * 4. GET /comments?postId=:id
   * Fetch comments using query parameter endpoint
   */
  getCommentsByQueryParam: async (postId: number): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>('/comments', {
      params: { postId },
    });
    return response.data;
  },

  /**
   * 5. POST /posts
   * Create a new post
   */
  createPost: async (postData: CreatePostDto): Promise<Post> => {
    const response = await apiClient.post<Post>('/posts', postData);
    return response.data;
  },

  /**
   * 6. PUT /posts/:id
   * Full resource update: replaces the entire post with the payload
   */
  updatePostPut: async (postId: number, postData: UpdatePostDto): Promise<Post> => {
    const response = await apiClient.put<Post>(`/posts/${postId}`, postData);
    return response.data;
  },

  /**
   * 7. PATCH /posts/:id
   * Partial resource update: updates only specified fields
   */
  patchPost: async (postId: number, partialData: PatchPostDto): Promise<Post> => {
    const response = await apiClient.patch<Post>(`/posts/${postId}`, partialData);
    return response.data;
  },

  /**
   * 8. DELETE /posts/:id
   * Delete a post
   */
  deletePost: async (postId: number): Promise<{ success: boolean; id: number }> => {
    await apiClient.delete(`/posts/${postId}`);
    return { success: true, id: postId };
  },
};
