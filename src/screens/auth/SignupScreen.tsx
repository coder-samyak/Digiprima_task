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
import { registerUser, clearAuthError } from '../../store/slices/authSlice';
import { validateSignup } from '../../utils/validation';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { ScreenNavigationProp } from '../../types/navigation.types';

interface SignupScreenProps {
  navigation: ScreenNavigationProp<'Signup'>;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignup = async () => {
    // Clear previous errors
    dispatch(clearAuthError());
    setSuccessMessage(null);

    // Validate fields
    const validation = validateSignup({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});

    try {
      const resultAction = await dispatch(
        registerUser({
          fullName,
          email,
          password,
        })
      );

      if (registerUser.fulfilled.match(resultAction)) {
        setSuccessMessage('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1200);
      }
    } catch (err) {
      console.error('Registration failed:', err);
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
    if (error) {
      dispatch(clearAuthError());
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="person-add-outline" size={30} color={colors.primary} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Sign up to manage and explore posts with REST API integration
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Server/Mock Error Banner */}
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

            {/* Success Banner */}
            {successMessage && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.successBannerText}>{successMessage}</Text>
              </View>
            )}

            {/* Full Name */}
            <CustomInput
              label="Full Name"
              required
              placeholder="e.g. Alex Johnson"
              leftIcon="person-outline"
              value={fullName}
              onChangeText={(text) => handleInputChange('fullName', text, setFullName)}
              error={formErrors.fullName}
              autoCapitalize="words"
            />

            {/* Email Address */}
            <CustomInput
              label="Email Address"
              required
              placeholder="name@example.com"
              leftIcon="mail-outline"
              value={email}
              onChangeText={(text) => handleInputChange('email', text, setEmail)}
              error={formErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password */}
            <CustomInput
              label="Password"
              required
              placeholder="At least 8 characters"
              leftIcon="lock-closed-outline"
              isPassword
              value={password}
              onChangeText={(text) => handleInputChange('password', text, setPassword)}
              error={formErrors.password}
              autoCapitalize="none"
            />

            {/* Confirm Password */}
            <CustomInput
              label="Confirm Password"
              required
              placeholder="Re-enter your password"
              leftIcon="shield-checkmark-outline"
              isPassword
              value={confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text, setConfirmPassword)}
              error={formErrors.confirmPassword}
              autoCapitalize="none"
            />

            {/* Submit Button */}
            <CustomButton
              title="Create Account"
              onPress={handleSignup}
              isLoading={isLoading}
              size="lg"
              style={styles.submitButton}
            />
          </View>

          {/* Footer / Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
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
  submitButton: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
