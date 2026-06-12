import React, { useContext } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../../state/ThemeContext';
import { ExpensesContext } from '../../state/ExpensesContext';
import { CategoriesContext } from '../../state/CategoriesContext';
import { useTheme } from '../../theme/useTheme';
import { clearAll } from '../../storage';
import { Theme } from '../../types';
import Constants from 'expo-constants';
import { LANGUAGES } from '../../i18n';

const CURRENCIES = ['$', '€', '£', '¥', '₹'];
const THEMES: Theme[] = ['light', 'dark', 'system'];

export default function SettingsScreen({ navigation }: any) {
  const { settings, dispatch } = useContext(SettingsContext);
  const { dispatch: expDispatch } = useContext(ExpensesContext);
  const { dispatch: catDispatch } = useContext(CategoriesContext);
  const theme = useTheme();
  const { t } = useTranslation();

  function handleClearData() {
    Alert.alert(t('settings.clearTitle'), t('settings.clearMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => clearAll().then(() => { expDispatch({ type: 'CLEAR' }); catDispatch({ type: 'RESET' }); }) },
    ]);
  }

  const SectionLabel = ({ title }: { title: string }) => (
    <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{title}</Text>
  );

  const NavRow = ({ icon, label, onPress, danger }: { icon: string; label: string; onPress?: () => void; danger?: boolean }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.navRow, { backgroundColor: theme.bgCard, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={[styles.navIcon, { backgroundColor: danger ? theme.dangerLight : theme.primaryLight }]}>
        <Ionicons name={icon as any} size={17} color={danger ? theme.danger : theme.primary} />
      </View>
      <Text style={[styles.navLabel, { color: danger ? theme.danger : theme.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={15} color={theme.textMuted} />
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('settings.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <SectionLabel title={t('settings.profile')} />
        <View style={[styles.profileCard, { backgroundColor: theme.primary, shadowColor: theme.shadow }]}>
          <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.avatarText}>{settings.username?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{settings.username}</Text>
            <Text style={styles.profileSub}>{t('settings.profileSub')}</Text>
          </View>
          <View style={[styles.profileBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.profileBadgeText}>Active</Text>
          </View>
        </View>

        {/* Theme */}
        <SectionLabel title={t('settings.appearance')} />
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>{t('settings.themeLabel')}</Text>
          <View style={styles.pillRow}>
            {THEMES.map(th => {
              const isActive = settings.theme === th;
              return (
                <Pressable
                  key={th}
                  onPress={() => dispatch({ type: 'UPDATE', payload: { theme: th } })}
                  style={[styles.pill, { backgroundColor: isActive ? theme.primary : theme.surface, borderColor: isActive ? theme.primary : theme.border }]}
                >
                  <Text style={[styles.pillText, { color: isActive ? '#fff' : theme.textSecondary }]}>
                    {t(`settings.theme${th.charAt(0).toUpperCase() + th.slice(1)}` as any)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Currency */}
        <SectionLabel title={t('settings.currency')} />
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={styles.pillRow}>
            {CURRENCIES.map(c => {
              const isActive = settings.currency === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => dispatch({ type: 'UPDATE', payload: { currency: c } })}
                  style={[styles.pill, { backgroundColor: isActive ? theme.primary : theme.surface, borderColor: isActive ? theme.primary : theme.border }]}
                >
                  <Text style={[styles.pillText, { color: isActive ? '#fff' : theme.textSecondary }]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Language */}
        <SectionLabel title={t('settings.language')} />
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={styles.pillRow}>
            {LANGUAGES.map(lang => {
              const isActive = settings.language === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => dispatch({ type: 'UPDATE', payload: { language: lang.code } })}
                  style={[styles.langPill, { backgroundColor: isActive ? theme.primary : theme.surface, borderColor: isActive ? theme.primary : theme.border }]}
                >
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <Text style={[styles.pillText, { color: isActive ? '#fff' : theme.textSecondary }]}>{lang.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Data */}
        <SectionLabel title={t('settings.data')} />
        <NavRow icon="list" label={t('settings.manageCategories')} onPress={() => navigation.navigate('ManageCategories')} />

        {/* Danger */}
        <SectionLabel title={t('settings.dangerZone')} />
        <NavRow icon="trash-outline" label={t('settings.clearData')} onPress={handleClearData} danger />

        {/* About */}
        <SectionLabel title={t('settings.about')} />
        <NavRow icon="information-circle-outline" label={t('about.title')} onPress={() => navigation.navigate('About')} />

        <Text style={[styles.version, { color: theme.textMuted }]}>v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  content: { paddingHorizontal: 20, paddingBottom: 48, gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 10, marginBottom: 2 },

  profileCard: {
    borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  profileName: { color: '#fff', fontSize: 17, fontWeight: '700' },
  profileSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 1 },
  profileBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  profileBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  card: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  cardLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  langPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  langFlag: { fontSize: 15 },
  pillText: { fontSize: 13, fontWeight: '600' },

  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  navIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  navLabel: { flex: 1, fontSize: 15, fontWeight: '500' },

  version: { fontSize: 12, textAlign: 'center', marginTop: 12 },
});
