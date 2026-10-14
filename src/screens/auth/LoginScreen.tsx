import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, demoLogin, clearAuthError } from '../../store/slices/authSlice';
import { validateLogin } from '../../utils/validation';
import { DEMO_USER } from '../../utils/storage';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { ScreenNavigationProp } from '../../types/navigation.types';

interface LoginScreenProps {
  navigation: ScreenNavigationProp<'Login'>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleLogin = async () => {
    dispatch(clearAuthError());

    const validation = validateLogin({ email, password });
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    await dispatch(loginUser({ email, password }));
  };

  const fillDemoCredentials = () => {
    setEmail(DEMO_USER.email);
    setPassword(DEMO_USER.passwordHash);
    setFormErrors({});
    dispatch(clearAuthError());
  };

  const handleInstantDemoLogin = () => {
    dispatch(demoLogin());
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
              <Ionicons name="lock-closed" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to access your posts management dashboard
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Error Banner */}
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

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
              placeholder="Enter your password"
              leftIcon="lock-closed-outline"
              isPassword
              value={password}
              onChangeText={(text) => handleInputChange('password', text, setPassword)}
              error={formErrors.password}
              autoCapitalize="none"
            />

            {/* Submit Button */}
            <CustomButton
              title="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              size="lg"
              style={styles.submitButton}
            />

            {/* Quick Demo Section */}
            <View style={styles.demoSection}>
              <View style={styles.demoDividerRow}>
                <View style={styles.demoDividerLine} />
                <Text style={styles.demoDividerText}>QUICK DEMO ACCESS</Text>
                <View style={styles.demoDividerLine} />
              </View>

              <View style={styles.demoButtonsRow}>
                <CustomButton
                  title="Auto-Fill Demo Credentials"
                  onPress={fillDemoCredentials}
                  variant="outline"
                  size="sm"
                  style={styles.demoButton}
                  icon={<Ionicons name="sparkles-outline" size={16} color={colors.primary} />}
                />
                <CustomButton
                  title="1-Tap Instant Login"
                  onPress={handleInstantDemoLogin}
                  variant="subtle"
                  size="sm"
                  style={styles.demoButton}
                  icon={<Ionicons name="flash-outline" size={16} color={colors.primaryDark} />}
                />
              </View>
            </View>
          </View>

          {/* Footer / Signup Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
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
    width: 64,
    height: 64,
    borderRadius: 32,
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
  submitButton: {
    marginTop: spacing.sm,
  },
  demoSection: {
    marginTop: spacing.xl,
  },
  demoDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  demoDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  demoDividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    paddingHorizontal: spacing.sm,
    letterSpacing: 0.5,
  },
  demoButtonsRow: {
    gap: spacing.sm,
  },
  demoButton: {
    width: '100%',
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
  signupLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
