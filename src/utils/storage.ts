import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth.types';
import { Post } from '../types/post.types';

const STORAGE_KEYS = {
  AUTH_SESSION: '@app_auth_session',
  REGISTERED_USERS: '@app_registered_users',
  DELETED_POST_IDS: '@app_deleted_post_ids',
  CREATED_POSTS: '@app_created_posts',
  UPDATED_POSTS: '@app_updated_posts',
};

export interface StoredSession {
  user: User;
  token: string;
}

export interface StoredUserAccount extends User {
  passwordHash: string; // Mock password storage
}

// Default seeded demo user for immediate testing
export const DEMO_USER: StoredUserAccount = {
  id: 'user-demo-1',
  fullName: 'John Doe',
  email: 'demo@example.com',
  passwordHash: 'password123',
  createdAt: new Date().toISOString(),
};

/**
 * Save user authentication session to AsyncStorage
 */
export const saveAuthSession = async (session: StoredSession): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save auth session:', error);
    throw error;
  }
};

/**
 * Get active user authentication session from AsyncStorage
 */
export const getAuthSession = async (): Promise<StoredSession | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch (error) {
    console.error('Failed to get auth session:', error);
    return null;
  }
};

/**
 * Clear user session (for Logout)
 */
export const clearAuthSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  } catch (error) {
    console.error('Failed to clear auth session:', error);
  }
};

/**
 * Retrieve registered mock users
 */
export const getRegisteredUsers = async (): Promise<StoredUserAccount[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (!raw) {
      // Seed initial demo user
      const initial = [DEMO_USER];
      await AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as StoredUserAccount[];
  } catch (error) {
    console.error('Failed to get registered users:', error);
    return [DEMO_USER];
  }
};

/**
 * Register a new mock user
 */
export const saveRegisteredUser = async (user: StoredUserAccount): Promise<void> => {
  try {
    const users = await getRegisteredUsers();
    // Check if user already exists
    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === user.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save registered user:', error);
    throw error;
  }
};

/**
 * Get IDs of posts that user has deleted
 */
export const getDeletedPostIds = async (): Promise<number[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_POST_IDS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

/**
 * Mark a post ID as deleted so it NEVER reappears on refresh
 */
export const saveDeletedPostId = async (id: number): Promise<void> => {
  try {
    const ids = await getDeletedPostIds();
    if (!ids.includes(id)) {
      ids.push(id);
      await AsyncStorage.setItem(STORAGE_KEYS.DELETED_POST_IDS, JSON.stringify(ids));
    }
    // Also remove from created posts if it was a locally created post
    const created = await getCreatedPosts();
    const filteredCreated = created.filter((p) => p.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.CREATED_POSTS, JSON.stringify(filteredCreated));
  } catch (e) {
    console.error('Failed to save deleted post ID:', e);
  }
};

/**
 * Get locally created posts
 */
export const getCreatedPosts = async (): Promise<Post[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CREATED_POSTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

/**
 * Persist newly created post so it stays on refresh
 */
export const saveCreatedPost = async (post: Post): Promise<void> => {
  try {
    const created = await getCreatedPosts();
    created.unshift(post);
    await AsyncStorage.setItem(STORAGE_KEYS.CREATED_POSTS, JSON.stringify(created));
  } catch (e) {
    console.error('Failed to save created post:', e);
  }
};

/**
 * Get locally updated posts map
 */
export const getUpdatedPosts = async (): Promise<Record<number, Post>> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.UPDATED_POSTS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
};

/**
 * Persist updated post (PUT/PATCH) so changes stay on refresh
 */
export const saveUpdatedPost = async (post: Post): Promise<void> => {
  try {
    const updated = await getUpdatedPosts();
    updated[post.id] = post;
    await AsyncStorage.setItem(STORAGE_KEYS.UPDATED_POSTS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save updated post:', e);
  }
};
