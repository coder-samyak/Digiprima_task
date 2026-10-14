export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

export interface CreatePostDto {
  title: string;
  body: string;
  userId: number;
}

export interface UpdatePostDto {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface PatchPostDto {
  id: number;
  title?: string;
  body?: string;
  userId?: number;
}

export interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  comments: Comment[];
  
  // Status flags
  isLoadingPosts: boolean;
  isRefreshingPosts: boolean;
  isLoadingCurrentPost: boolean;
  isLoadingComments: boolean;
  isSubmittingPost: boolean;
  isDeletingPost: boolean;
  
  // Error messages
  postsError: string | null;
  currentPostError: string | null;
  commentsError: string | null;
  actionError: string | null;
  
  // Filter
  searchQuery: string;
  
  // Last API Call Info (for demonstration & debugging feedback)
  lastApiCall: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | null;
    endpoint: string | null;
    status: number | null;
    timestamp: string | null;
  } | null;
}
