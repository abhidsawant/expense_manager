import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { useTheme } from '../../theme/useTheme';

const LINKS = [
  { key: 'githubRepo', icon: 'logo-github', url: 'https://github.com/abhidsawant/expense_manager' },
  { key: 'expoDocs',   icon: 'cube-outline', url: 'https://docs.expo.dev' },
  { key: 'rnDocs',     icon: 'phone-portrait-outline', url: 'https://reactnative.dev' },
] as const;

export default function AboutScreen({ navigation }: any) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>{t('about.title')}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* App identity */}
        <View style={styles.identity}>
          <View style={[styles.appIcon, { backgroundColor: theme.primary, shadowColor: theme.shadow }]}>
            <Text style={styles.appEmoji}>💸</Text>
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>ExpenseFlow</Text>
          <View style={[styles.versionBadge, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.versionText, { color: theme.primary }]}>
              {t('about.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.descCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.descText, { color: theme.textSecondary }]}>{t('about.description')}</Text>
        </View>

        {/* Links */}
        <View style={[styles.linksCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          {LINKS.map(({ key, icon, url }, idx) => (
            <View key={key}>
              <Pressable
                onPress={() => Linking.openURL(url)}
                style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.7 : 1 }]}
              >
                <View style={[styles.linkIcon, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name={icon as any} size={17} color={theme.primary} />
                </View>
                <Text style={[styles.linkText, { color: theme.text }]}>{t(`about.${key}` as any)}</Text>
                <Ionicons name="arrow-forward-outline" size={15} color={theme.textMuted} />
              </Pressable>
              {idx < LINKS.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
            </View>
          ))}
        </View>

        {/* Made with */}
        <View style={styles.madeWith}>
          <Text style={[styles.madeWithText, { color: theme.textMuted }]}>Made with ❤️ using React Native + Expo</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 48, gap: 20 },

  identity: { alignItems: 'center', gap: 12 },
  appIcon: {
    width: 88, height: 88, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 8,
  },
  appEmoji: { fontSize: 42 },
  appName: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  versionBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  versionText: { fontSize: 13, fontWeight: '600' },

  descCard: { borderRadius: 16, borderWidth: 1, padding: 18 },
  descText: { fontSize: 14, lineHeight: 22, textAlign: 'center' },

  linksCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  linkIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  linkText: { flex: 1, fontSize: 15, fontWeight: '500' },
  divider: { height: 1, marginLeft: 62 },

  madeWith: { alignItems: 'center' },
  madeWithText: { fontSize: 13 },
});
