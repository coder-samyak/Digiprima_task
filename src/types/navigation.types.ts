import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  // Auth routes
  Login: undefined;
  Signup: undefined;
  
  // App routes
  Home: undefined;
  PostDetails: { postId: number };
  CreatePost: undefined;
  EditPost: { postId: number };
};

export type ScreenNavigationProp<T extends keyof RootStackParamList> = NativeStackNavigationProp<
  RootStackParamList,
  T
>;

export type ScreenRouteProp<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;
