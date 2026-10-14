import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store';
import { restoreSession } from '../store/slices/authSlice';
import { RootStackParamList } from '../types/navigation.types';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';

// Posts Screens
import { HomeScreen } from '../screens/posts/HomeScreen';
import { PostDetailsScreen } from '../screens/posts/PostDetailsScreen';
import { CreatePostScreen } from '../screens/posts/CreatePostScreen';
import { EditPostScreen } from '../screens/posts/EditPostScreen';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isRestoringSession } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  // Initial session restoration splash
  if (isRestoringSession) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashBadge}>
          <Text style={styles.splashLogoText}>RN</Text>
        </View>
        <Text style={styles.splashAppTitle}>Posts Management</Text>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.splashSpinner}
        />
        <Text style={styles.splashSubtext}>Restoring session...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </Stack.Group>
        ) : (
          // Main Application Stack
          <Stack.Group>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="EditPost" component={EditPostScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  splashBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  splashLogoText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  splashAppTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  splashSpinner: {
    marginVertical: spacing.md,
  },
  splashSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
