import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchPostById,
  updatePostPut,
  patchPost,
  clearActionError,
} from '../../store/slices/postsSlice';
import { validatePostForm } from '../../utils/validation';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { ScreenNavigationProp, ScreenRouteProp } from '../../types/navigation.types';

interface EditPostScreenProps {
  navigation: ScreenNavigationProp<'EditPost'>;
  route: ScreenRouteProp<'EditPost'>;
}

export const EditPostScreen: React.FC<EditPostScreenProps> = ({
  navigation,
  route,
}) => {
  const { postId } = route.params;
  const dispatch = useAppDispatch();

  const {
    posts,
    currentPost,
    isLoadingCurrentPost,
    isSubmittingPost,
    actionError,
  } = useAppSelector((state) => state.posts);

  const existingPost =
    (currentPost && currentPost.id === postId ? currentPost : null) ||
    posts.find((p) => p.id === postId);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalBody, setOriginalBody] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setBody(existingPost.body);
      setOriginalTitle(existingPost.title);
      setOriginalBody(existingPost.body);
    } else {
      // If not yet in cache, fetch it
      dispatch(fetchPostById(postId));
    }
  }, [existingPost, postId, dispatch]);

  const handleSave = async () => {
    dispatch(clearActionError());
    setSuccessBanner(null);

    const validation = validatePostForm({ title, body });
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});

    try {
      const titleTrimmed = title.trim();
      const bodyTrimmed = body.trim();
      const titleChanged = titleTrimmed !== originalTitle.trim();
      const bodyChanged = bodyTrimmed !== originalBody.trim();

      // If only one property changed, use PATCH; if both or neither, use PUT
      if (titleChanged && !bodyChanged) {
        const resultAction = await dispatch(
          patchPost({ id: postId, title: titleTrimmed })
        );
        if (patchPost.fulfilled.match(resultAction)) {
          setSuccessBanner('Post updated successfully!');
          setTimeout(() => {
            navigation.goBack();
          }, 1000);
        }
      } else if (!titleChanged && bodyChanged) {
        const resultAction = await dispatch(
          patchPost({ id: postId, body: bodyTrimmed })
        );
        if (patchPost.fulfilled.match(resultAction)) {
          setSuccessBanner('Post updated successfully!');
          setTimeout(() => {
            navigation.goBack();
          }, 1000);
        }
      } else {
        const resultAction = await dispatch(
          updatePostPut({
            id: postId,
            title: titleTrimmed,
            body: bodyTrimmed,
            userId: existingPost ? existingPost.userId : 1,
          })
        );
        if (updatePostPut.fulfilled.match(resultAction)) {
          setSuccessBanner('Post updated successfully!');
          setTimeout(() => {
            navigation.goBack();
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Failed to update post:', err);
    }
  };

  const handleInputChange = (
    field: string,
    value: string,
    setter: (val: string) => void
  ) => {
    setter(value);
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  if (isLoadingCurrentPost && !existingPost) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingSpinner message="Loading post details to edit..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Post #{postId}</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Action Error Banner */}
          {actionError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorBannerText}>{actionError}</Text>
            </View>
          )}

          {/* Success Banner */}
          {successBanner && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.successBannerText}>{successBanner}</Text>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.card}>
            <CustomInput
              label="Post Title"
              required
              placeholder="Edit title..."
              value={title}
              onChangeText={(text) => handleInputChange('title', text, setTitle)}
              error={formErrors.title}
            />

            <CustomInput
              label="Post Content"
              required
              placeholder="Edit content body..."
              value={body}
              onChangeText={(text) => handleInputChange('body', text, setBody)}
              error={formErrors.body}
              multiline
              numberOfLines={6}
            />

            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
              <CustomButton
                title="Save Changes"
                onPress={handleSave}
                isLoading={isSubmittingPost}
                size="lg"
                icon={<Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />}
              />

              <CustomButton
                title="Cancel"
                onPress={() => navigation.goBack()}
                variant="secondary"
                size="md"
                disabled={isSubmittingPost}
                style={styles.cancelButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  successBannerText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  buttonGroup: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  cancelButton: {
    marginTop: spacing.xs,
  },
});
