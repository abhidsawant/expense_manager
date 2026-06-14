import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, Animated } from 'react-native';
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const bg = variant === 'primary' ? theme.primary
    : variant === 'danger' ? theme.danger
    : 'transparent';

  const textColor = variant === 'ghost' ? theme.primary : '#fff';
  const borderColor = variant === 'ghost' ? theme.primary : 'transparent';

  function onPressIn() {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  }
  function onPressOut() {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        style={[
          styles.btn,
          {
            backgroundColor: disabled ? theme.surface : bg,
            borderColor: disabled ? theme.border : borderColor,
            shadowColor: theme.shadow,
          },
        ]}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={[styles.label, { color: disabled ? theme.textMuted : textColor }]}>{label}</Text>
        }
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
