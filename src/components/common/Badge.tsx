import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface BadgeProps {
  label: string;
  variant?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'default' | 'success';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
}) => {
  const getColors = () => {
    switch (variant) {
      case 'get':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'post':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      case 'put':
        return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
      case 'patch':
        return { bg: '#FAF5FF', text: '#7C3AED', border: '#E9D5FF' };
      case 'delete':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
      case 'success':
        return { bg: '#ECFDF5', text: '#10B981', border: '#A7F3D0' };
      default:
        return { bg: colors.surfaceSubtle, text: colors.textSecondary, border: colors.border };
    }
  };

  const styleColors = getColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: styleColors.bg,
          borderColor: styleColors.border,
          paddingVertical: size === 'sm' ? 2 : 4,
          paddingHorizontal: size === 'sm' ? 6 : 10,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: styleColors.text,
            fontSize: size === 'sm' ? 11 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
