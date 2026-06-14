import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';

export function EmptyState({ message }: { message: string }) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.ring, { borderColor: theme.border }]}>
        <View style={[styles.iconWrap, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="wallet-outline" size={36} color={theme.primary} />
        </View>
      </View>
      <Text style={[styles.text, { color: theme.text }]}>{message}</Text>
      <Text style={[styles.sub, { color: theme.textMuted }]}>Your expenses will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 14 },
  ring: { width: 96, height: 96, borderRadius: 48, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, textAlign: 'center', lineHeight: 24, fontWeight: '700' },
  sub: { fontSize: 13, textAlign: 'center', fontWeight: '400' },
});
