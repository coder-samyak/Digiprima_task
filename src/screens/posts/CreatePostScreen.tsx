import React, { useState } from 'react';
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
import { createPost, clearActionError } from '../../store/slices/postsSlice';
import { validatePostForm } from '../../utils/validation';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { ScreenNavigationProp } from '../../types/navigation.types';

interface CreatePostScreenProps {
  navigation: ScreenNavigationProp<'CreatePost'>;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isSubmittingPost, actionError } = useAppSelector((state) => state.posts);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleCreate = async () => {
    dispatch(clearActionError());
    setSuccessBanner(null);

    const validation = validatePostForm({ title, body });
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});

    try {
      const resultAction = await dispatch(
        createPost({
          title: title.trim(),
          body: body.trim(),
          userId: 1, // Default user ID per JSONPlaceholder spec
        })
      );

      if (createPost.fulfilled.match(resultAction)) {
        setSuccessBanner('Post created successfully via POST /posts!');
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleInputChange = (field: string, value: string, setter: (val: string) => void) => {
    setter(value);
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Create New Post</Text>
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

          {/* Error Banner */}
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
            {/* Title Input */}
            <CustomInput
              label="Post Title"
              required
              placeholder="Enter an informative title..."
              value={title}
              onChangeText={(text) => handleInputChange('title', text, setTitle)}
              error={formErrors.title}
            />

            {/* Body Input */}
            <CustomInput
              label="Post Content"
              required
              placeholder="Write the full content of your post here..."
              value={body}
              onChangeText={(text) => handleInputChange('body', text, setBody)}
              error={formErrors.body}
              multiline
              numberOfLines={6}
            />

            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
              <CustomButton
                title="Publish Post"
                onPress={handleCreate}
                isLoading={isSubmittingPost}
                size="lg"
                icon={<Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />}
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
