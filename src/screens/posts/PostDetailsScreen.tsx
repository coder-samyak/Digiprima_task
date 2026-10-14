import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchPostById,
  deletePost,
  clearCurrentPost,
} from '../../store/slices/postsSlice';
import { fetchComments } from '../../store/slices/commentsSlice';
import { ScreenNavigationProp, ScreenRouteProp } from '../../types/navigation.types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { CustomButton } from '../../components/common/CustomButton';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Badge } from '../../components/common/Badge';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';

interface PostDetailsScreenProps {
  navigation: ScreenNavigationProp<'PostDetails'>;
  route: ScreenRouteProp<'PostDetails'>;
}

export const PostDetailsScreen: React.FC<PostDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { postId } = route.params;
  const dispatch = useAppDispatch();

  const {
    currentPost,
    isLoadingCurrentPost,
    isDeletingPost,
    currentPostError,
    actionError,
  } = useAppSelector((state) => state.posts);

  const {
    comments,
    isLoadingComments,
    commentsError,
  } = useAppSelector((state) => state.comments);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Fetch post and comments on mount
    dispatch(fetchPostById(postId));
    dispatch(fetchComments({ postId }));
  }, [dispatch, postId]);

  const handleConfirmDelete = async () => {
    try {
      const resultAction = await dispatch(deletePost(postId));
      setShowDeleteModal(false);

      if (deletePost.fulfilled.match(resultAction)) {
        Alert.alert(
          'Post Deleted',
          `Post #${postId} was successfully deleted. Note: Simulated by JSONPlaceholder.`,
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>Post #{postId}</Text>

        <View style={styles.navActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditPost', { postId })}
            style={styles.navIconButton}
            accessibilityLabel="Edit Post"
          >
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            style={styles.navIconButton}
            accessibilityLabel="Delete Post"
          >
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Post Loading & Error States */}
        {isLoadingCurrentPost ? (
          <LoadingSpinner message={`Loading post #${postId}...`} />
        ) : currentPostError ? (
          <ErrorMessage
            title="Failed to Load Post"
            message={currentPostError}
            onRetry={() => dispatch(fetchPostById(postId))}
          />
        ) : currentPost ? (
          <View style={styles.postCard}>
            {/* Post Metadata Header */}
            <View style={styles.postMetaRow}>
              <View style={styles.idChip}>
                <Text style={styles.idChipText}>POST ID: {currentPost.id}</Text>
              </View>
              <View style={styles.userChip}>
                <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.userChipText}>USER ID: {currentPost.userId}</Text>
              </View>
            </View>

            {/* Post Title */}
            <Text style={styles.postTitle}>{currentPost.title}</Text>

            {/* Post Body */}
            <Text style={styles.postBody}>{currentPost.body}</Text>

            {/* Quick Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <CustomButton
                title="Edit Post"
                onPress={() => navigation.navigate('EditPost', { postId })}
                variant="outline"
                size="sm"
                icon={<Ionicons name="create-outline" size={16} color={colors.primary} />}
                style={styles.actionButtonFlex}
              />
              <CustomButton
                title="Delete Post"
                onPress={() => setShowDeleteModal(true)}
                variant="danger"
                size="sm"
                icon={<Ionicons name="trash-outline" size={16} color="#FFFFFF" />}
                style={styles.actionButtonFlex}
              />
            </View>
          </View>
        ) : null}

        {/* Action Error if any */}
        {actionError && (
          <ErrorMessage
            title="Action Failed"
            message={actionError}
            style={styles.actionErrorMargin}
          />
        )}

        {/* Comments Section */}
        <View style={styles.commentsContainer}>
          <View style={styles.commentsHeaderRow}>
            <View style={styles.commentsTitleGroup}>
              <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
              <Text style={styles.commentsSectionTitle}>
                Comments ({comments.length})
              </Text>
            </View>
          </View>

          {isLoadingComments ? (
            <LoadingSpinner message="Fetching comments..." size="small" />
          ) : commentsError ? (
            <ErrorMessage
              title="Failed to Load Comments"
              message={commentsError}
              onRetry={() => dispatch(fetchComments({ postId }))}
            />
          ) : comments.length === 0 ? (
            <Text style={styles.noCommentsText}>No comments found for this post.</Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {comment.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.commentAuthorInfo}>
                    <Text style={styles.commentName} numberOfLines={1}>
                      {comment.name}
                    </Text>
                    <Text style={styles.commentEmail} numberOfLines={1}>
                      {comment.email}
                    </Text>
                  </View>
                </View>
                <Text style={styles.commentBody}>{comment.body}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Post"
        message={`Are you sure you want to delete this post #${postId}?`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        isLoading={isDeletingPost}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navIconButton: {
    padding: spacing.xs + 2,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  postCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    marginBottom: spacing.xl,
  },
  postMetaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  idChip: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
  },
  idChipText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  userChipText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 28,
    marginBottom: spacing.md,
    textTransform: 'capitalize',
  },
  postBody: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  actionButtonFlex: {
    flex: 1,
  },
  actionErrorMargin: {
    marginBottom: spacing.lg,
  },
  commentsContainer: {
    marginTop: spacing.sm,
  },
  commentsHeaderRow: {
    flexDirection: 'column',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  commentsTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  endpointToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: 2,
    alignSelf: 'flex-start',
  },
  toggleTab: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  toggleTabActive: {
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
  },
  toggleTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  noCommentsText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  commentCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  commentAuthorInfo: {
    flex: 1,
  },
  commentName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  commentEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  commentBody: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});
