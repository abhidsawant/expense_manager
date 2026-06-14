import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { useTheme } from '../../theme/useTheme';
import { useResponsive } from '../../theme/useResponsive';

const LINKS = [
  { key: 'githubRepo', icon: 'logo-github',           url: 'https://github.com/abhidsawant/expense_manager' },
  { key: 'expoDocs',   icon: 'cube-outline',           url: 'https://docs.expo.dev' },
  { key: 'rnDocs',     icon: 'phone-portrait-outline', url: 'https://reactnative.dev' },
] as const;

const STACK = ['React Native', 'Expo', 'TypeScript', 'AsyncStorage', 'React Navigation', 'i18next'];

export default function AboutScreen({ navigation }: any) {
  const theme = useTheme();
  const { rs, hPad } = useResponsive();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border, paddingHorizontal: hPad }]}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>{t('about.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: hPad }]} showsVerticalScrollIndicator={false}>

        {/* App identity */}
        <View style={styles.identity}>
          <View style={[styles.appIcon, { backgroundColor: theme.primary, shadowColor: theme.shadow, width: rs(96, 76, 112), height: rs(96, 76, 112), borderRadius: rs(28, 20, 32) }]}>
            <Text style={[styles.appEmoji, { fontSize: rs(46, 34, 54) }]}>💸</Text>
          </View>
          <Text style={[styles.appName, { color: theme.text, fontSize: rs(30, 24, 36) }]}>ExpenseFlow</Text>
          <View style={[styles.versionBadge, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="pricetag-outline" size={12} color={theme.primary} />
            <Text style={[styles.versionText, { color: theme.primary, fontSize: rs(13, 11, 15) }]}>
              {t('about.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.descCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.descText, { color: theme.textSecondary, fontSize: rs(14, 12, 16) }]}>
            {t('about.description')}
          </Text>
        </View>

        {/* Tech stack */}
        <View style={[styles.stackCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={styles.stackHeader}>
            <View style={[styles.stackIconWrap, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="code-slash-outline" size={15} color={theme.primary} />
            </View>
            <Text style={[styles.stackTitle, { color: theme.text }]}>Built with</Text>
          </View>
          <View style={styles.pillsRow}>
            {STACK.map(item => (
              <View key={item} style={[styles.stackPill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.stackPillText, { color: theme.textSecondary }]}>{item}</Text>
              </View>
            ))}
          </View>
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
                <Text style={[styles.linkText, { color: theme.text, fontSize: rs(15, 13, 17) }]}>{t(`about.${key}` as any)}</Text>
                <Ionicons name="arrow-forward-outline" size={15} color={theme.textMuted} />
              </Pressable>
              {idx < LINKS.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>Made with ❤️ using React Native + Expo</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700' },
  content: { paddingTop: 36, paddingBottom: 48, gap: 18 },

  identity: { alignItems: 'center', gap: 12 },
  appIcon: {
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 18, elevation: 10,
  },
  appEmoji: {},
  appName: { fontWeight: '800', letterSpacing: -0.5 },
  versionBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  versionText: { fontWeight: '700' },

  descCard: { borderRadius: 20, borderWidth: 1, padding: 18 },
  descText: { lineHeight: 22, textAlign: 'center' },

  stackCard: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 14 },
  stackHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stackIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stackTitle: { fontSize: 14, fontWeight: '700' },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stackPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  stackPillText: { fontSize: 12, fontWeight: '600' },

  linksCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  linkIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  linkText: { flex: 1, fontWeight: '600' },
  divider: { height: 1, marginLeft: 64 },

  footer: { alignItems: 'center', paddingTop: 4 },
  footerText: { fontSize: 13 },
});
