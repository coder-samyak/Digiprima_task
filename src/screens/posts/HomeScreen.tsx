import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchPosts, setSearchQuery, deletePost } from '../../store/slices/postsSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { Post } from '../../types/post.types';
import { ScreenNavigationProp } from '../../types/navigation.types';
import { CustomInput } from '../../components/common/CustomInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';

interface HomeScreenProps {
  navigation: ScreenNavigationProp<'Home'>;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    posts,
    isLoadingPosts,
    isRefreshingPosts,
    isDeletingPost,
    postsError,
    searchQuery,
  } = useAppSelector((state) => state.posts);

  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchPosts(false));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchPosts(true));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleConfirmDelete = async () => {
    if (postToDelete === null) return;
    try {
      await dispatch(deletePost(postToDelete));
      setPostToDelete(null);
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };

  // Filter posts by title using searchQuery
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase().trim();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.body.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  const renderPostItem = ({ item }: ListRenderItemInfo<Post>) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
        style={styles.postCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>#{item.id}</Text>
            </View>
            <View style={styles.userBadge}>
              <Ionicons name="person-circle-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.userBadgeText}>User {item.userId}</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPostToDelete(item.id)}
            style={styles.cardDeleteButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Delete Post ${item.id}`}
          >
            <Ionicons name="trash-outline" size={17} color={colors.error} />
          </TouchableOpacity>
        </View>

        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.postBodyPreview} numberOfLines={2}>
          {item.body.replace(/\n/g, ' ')}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.readMoreText}>View details & comments</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top App Header */}
      <View style={styles.topHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeGreeting}>Welcome back,</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.fullName || 'User'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePost')}
            style={styles.createButton}
            accessibilityLabel="Create Post"
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>New Post</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            accessibilityLabel="Log Out"
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <CustomInput
          placeholder="Filter posts by title or keyword..."
          leftIcon="search-outline"
          value={searchQuery}
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          showClearButton
          onClear={() => dispatch(setSearchQuery(''))}
          containerStyle={styles.searchInputContainer}
        />
      </View>

      {/* Main Content */}
      {isLoadingPosts && !isRefreshingPosts ? (
        <LoadingSpinner message="Fetching posts from JSONPlaceholder..." />
      ) : postsError ? (
        <View style={styles.stateWrapper}>
          <ErrorMessage
            title="Failed to Load Posts"
            message={postsError}
            onRetry={() => dispatch(fetchPosts(false))}
          />
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshingPosts}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeaderRow}>
              <Text style={styles.listHeaderTitle}>
                {searchQuery ? `Search Results (${filteredPosts.length})` : `All Posts (${posts.length})`}
              </Text>
              <Text style={styles.listHeaderSubtitle}>Pull to refresh</Text>
            </View>
          }
          ListEmptyComponent={
            searchQuery ? (
              <EmptyState
                icon="search-outline"
                title="No Posts Found"
                description={`No post titles matched "${searchQuery}". Try a different keyword.`}
                actionTitle="Clear Search"
                onAction={() => dispatch(setSearchQuery(''))}
              />
            ) : (
              <EmptyState
                icon="newspaper-outline"
                title="No Posts Yet"
                description="There are currently no posts available."
                actionTitle="Refresh"
                onAction={handleRefresh}
              />
            )
          }
        />
      )}

      {/* Floating Action Button for Create Post */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Ionicons name="pencil" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={postToDelete !== null}
        title="Delete Post"
        message={`Are you sure you want to delete this post #${postToDelete}?`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        isLoading={isDeletingPost}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPostToDelete(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  welcomeGreeting: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs + 3,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    marginBottom: spacing.sm,
  },
  stateWrapper: {
    padding: spacing.xl,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 80, // Space for FAB
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  listHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  listHeaderSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  postCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardDeleteButton: {
    padding: spacing.xs,
    borderRadius: 4,
  },
  idBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userBadgeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  postBodyPreview: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: spacing.sm,
  },
  readMoreText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
});
