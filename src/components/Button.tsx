import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', disabled, loading, style }: Props) {
  const theme = useTheme();

  const bg = variant === 'primary' ? theme.primary
    : variant === 'danger' ? theme.danger
    : 'transparent';

  const textColor = variant === 'ghost' ? theme.primary : '#fff';
  const borderColor = variant === 'ghost' ? theme.primary : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: disabled ? theme.surface : bg,
          borderColor: disabled ? theme.border : borderColor,
          opacity: pressed ? 0.85 : 1,
          shadowColor: theme.shadow,
        },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={[styles.label, { color: disabled ? theme.textMuted : textColor }]}>{label}</Text>
      }
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
