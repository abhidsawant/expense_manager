import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Modal, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../../state/ThemeContext';
import { ExpensesContext } from '../../state/ExpensesContext';
import { CategoriesContext } from '../../state/CategoriesContext';
import { useTheme } from '../../theme/useTheme';
import { useResponsive } from '../../theme/useResponsive';
import { clearAll } from '../../storage';
import { Theme } from '../../types';
import Constants from 'expo-constants';
import { symbolForCode, useCurrencies } from '../../hooks/useExchangeRates';
import { usePublicHolidays } from '../../hooks/usePublicHolidays';

import { LANGUAGES } from '../../i18n';

const THEMES: Theme[] = ['light', 'dark', 'system'];

type DropdownItem = { label: string; value: string; sublabel?: string };

const COUNTRIES: DropdownItem[] = [
  { value: 'AR', label: '🇦🇷', sublabel: 'Argentina' },
  { value: 'AU', label: '🇦🇺', sublabel: 'Australia' },
  { value: 'AT', label: '🇦🇹', sublabel: 'Austria' },
  { value: 'BD', label: '🇧🇩', sublabel: 'Bangladesh' },
  { value: 'BE', label: '🇧🇪', sublabel: 'Belgium' },
  { value: 'BR', label: '🇧🇷', sublabel: 'Brazil' },
  { value: 'CA', label: '🇨🇦', sublabel: 'Canada' },
  { value: 'CN', label: '🇨🇳', sublabel: 'China' },
  { value: 'HR', label: '🇭🇷', sublabel: 'Croatia' },
  { value: 'CZ', label: '🇨🇿', sublabel: 'Czechia' },
  { value: 'DK', label: '🇩🇰', sublabel: 'Denmark' },
  { value: 'EG', label: '🇪🇬', sublabel: 'Egypt' },
  { value: 'FI', label: '🇫🇮', sublabel: 'Finland' },
  { value: 'FR', label: '🇫🇷', sublabel: 'France' },
  { value: 'DE', label: '🇩🇪', sublabel: 'Germany' },
  { value: 'GR', label: '🇬🇷', sublabel: 'Greece' },
  { value: 'HK', label: '🇭🇰', sublabel: 'Hong Kong' },
  { value: 'HU', label: '🇭🇺', sublabel: 'Hungary' },
  { value: 'IN', label: '🇮🇳', sublabel: 'India' },
  { value: 'ID', label: '🇮🇩', sublabel: 'Indonesia' },
  { value: 'IE', label: '🇮🇪', sublabel: 'Ireland' },
  { value: 'IL', label: '🇮🇱', sublabel: 'Israel' },
  { value: 'IT', label: '🇮🇹', sublabel: 'Italy' },
  { value: 'JP', label: '🇯🇵', sublabel: 'Japan' },
  { value: 'KE', label: '🇰🇪', sublabel: 'Kenya' },
  { value: 'KR', label: '🇰🇷', sublabel: 'South Korea' },
  { value: 'MX', label: '🇲🇽', sublabel: 'Mexico' },
  { value: 'NG', label: '🇳🇬', sublabel: 'Nigeria' },
  { value: 'NL', label: '🇳🇱', sublabel: 'Netherlands' },
  { value: 'NO', label: '🇳🇴', sublabel: 'Norway' },
  { value: 'NZ', label: '🇳🇿', sublabel: 'New Zealand' },
  { value: 'PH', label: '🇵🇭', sublabel: 'Philippines' },
  { value: 'PK', label: '🇵🇰', sublabel: 'Pakistan' },
  { value: 'PL', label: '🇵🇱', sublabel: 'Poland' },
  { value: 'PT', label: '🇵🇹', sublabel: 'Portugal' },
  { value: 'RO', label: '🇷🇴', sublabel: 'Romania' },
  { value: 'RU', label: '🇷🇺', sublabel: 'Russia' },
  { value: 'SA', label: '🇸🇦', sublabel: 'Saudi Arabia' },
  { value: 'SG', label: '🇸🇬', sublabel: 'Singapore' },
  { value: 'ZA', label: '🇿🇦', sublabel: 'South Africa' },
  { value: 'ES', label: '🇪🇸', sublabel: 'Spain' },
  { value: 'SE', label: '🇸🇪', sublabel: 'Sweden' },
  { value: 'CH', label: '🇨🇭', sublabel: 'Switzerland' },
  { value: 'TH', label: '🇹🇭', sublabel: 'Thailand' },
  { value: 'TR', label: '🇹🇷', sublabel: 'Türkiye' },
  { value: 'TW', label: '🇹🇼', sublabel: 'Taiwan' },
  { value: 'UA', label: '🇺🇦', sublabel: 'Ukraine' },
  { value: 'GB', label: '🇬🇧', sublabel: 'United Kingdom' },
  { value: 'US', label: '🇺🇸', sublabel: 'United States' },
  { value: 'VN', label: '🇻🇳', sublabel: 'Vietnam' },
];

function DropdownPicker({
  items,
  selectedValue,
  onSelect,
  placeholder,
  loading,
}: {
  items: DropdownItem[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const selected = items.find(i => i.value === selectedValue);

  return (
    <>
      <Pressable
        onPress={() => !loading && setOpen(true)}
        style={[styles.dropdownTrigger, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <View style={styles.dropdownTriggerContent}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.textMuted} />
          ) : selected ? (
            <>
              <Text style={[styles.dropdownTriggerText, { color: theme.text }]}>{selected.label}</Text>
              {selected.sublabel ? (
                <Text style={[styles.dropdownTriggerText, { color: theme.text }]}>{selected.sublabel}</Text>
              ) : null}
            </>
          ) : (
            <Text style={[styles.dropdownTriggerText, { color: theme.textMuted }]}>{placeholder}</Text>
          )}
        </View>
        <Ionicons name="chevron-down" size={16} color={theme.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.dropdownOverlay} onPress={() => setOpen(false)}>
          <View style={[styles.dropdownSheet, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <FlatList
              data={items}
              keyExtractor={item => item.value}
              renderItem={({ item }) => {
                const isActive = item.value === selectedValue;
                return (
                  <Pressable
                    onPress={() => { onSelect(item.value); setOpen(false); }}
                    style={[
                      styles.dropdownItem,
                      { borderBottomColor: theme.border, backgroundColor: isActive ? theme.primaryLight : 'transparent' },
                    ]}
                  >
                    <Text style={[styles.dropdownItemLabel, { color: isActive ? theme.primary : theme.text }]}>{item.label}</Text>
                    {item.sublabel ? (
                      <Text style={[styles.dropdownItemSub, { color: isActive ? theme.primary : theme.textMuted }]}>{item.sublabel}</Text>
                    ) : null}
                    {isActive ? <Ionicons name="checkmark" size={16} color={theme.primary} /> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default function SettingsScreen({ navigation }: any) {
  const { settings, dispatch } = useContext(SettingsContext);
  const { dispatch: expDispatch } = useContext(ExpensesContext);
  const { dispatch: catDispatch } = useContext(CategoriesContext);
  const theme = useTheme();
  const { rs, hPad } = useResponsive();
  const { t } = useTranslation();
  const { currencies, loading: currenciesLoading, error: currenciesError, retry: retryCurrencies } = useCurrencies();
  const { error: holidayError, loading: holidayLoading } = usePublicHolidays(new Date().getFullYear(), settings.holidayCountry ?? 'US');

  function handleClearData() {
    Alert.alert(t('settings.clearTitle'), t('settings.clearMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive', onPress: () =>
          clearAll().then(() => {
            expDispatch({ type: 'CLEAR' });
            catDispatch({ type: 'RESET' });
            dispatch({ type: 'UPDATE', payload: { username: '' } });
            navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
          }),
      },
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

  const currencyItems: DropdownItem[] = Object.entries(currencies)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, name]) => ({ value: code, label: `${symbolForCode(code)} ${code}`, sublabel: name }));
  const languageItems: DropdownItem[] = LANGUAGES.map(l => ({ value: l.code, label: l.flag, sublabel: l.label }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: hPad }]}>
        <Text style={[styles.title, { color: theme.text, fontSize: rs(26, 22, 32) }]}>{t('settings.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: hPad }]} showsVerticalScrollIndicator={false}>

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
          <DropdownPicker
            items={currencyItems}
            selectedValue={settings.displayCurrency ?? settings.baseCurrency ?? 'USD'}
            onSelect={value => dispatch({ type: 'UPDATE', payload: { displayCurrency: value, currency: symbolForCode(value) } })}
            placeholder="Select currency"
            loading={currenciesLoading}
          />
          {currenciesError ? (
            <Pressable onPress={retryCurrencies} style={[styles.errorBanner, { backgroundColor: theme.dangerLight }]}>
              <Ionicons name="warning-outline" size={14} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>Unable to load currencies — tap to retry</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Language */}
        <SectionLabel title={t('settings.language')} />
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <DropdownPicker
            items={languageItems}
            selectedValue={settings.language}
            onSelect={value => dispatch({ type: 'UPDATE', payload: { language: value } })}
            placeholder="Select language"
          />
        </View>

        {/* Public Holidays Country */}
        <SectionLabel title={t('settings.country')} />
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.cardHint, { color: theme.textMuted }]}>Holiday names shown on Home screen section headers</Text>
          <DropdownPicker
            items={COUNTRIES}
            selectedValue={settings.holidayCountry ?? 'US'}
            onSelect={value => dispatch({ type: 'UPDATE', payload: { holidayCountry: value } })}
            placeholder="Select country"
            loading={holidayLoading}
          />
          {holidayError ? (
            <View style={[styles.errorBanner, { backgroundColor: theme.dangerLight }]}>
              <Ionicons name="warning-outline" size={14} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>
                Holidays not available for this country
              </Text>
            </View>
          ) : null}
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
  cardHint: { fontSize: 11, marginTop: 1 },
  currencyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  currencyBadge: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  currencyCode: { fontSize: 12, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  pillText: { fontSize: 13, fontWeight: '600' },

  dropdownTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5,
  },
  dropdownTriggerContent: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  dropdownTriggerText: { fontSize: 14, fontWeight: '600' },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 32 },
  dropdownSheet: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', maxHeight: 320 },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, gap: 8,
  },
  dropdownItemLabel: { fontSize: 15, fontWeight: '600', flex: 1 },
  dropdownItemSub: { fontSize: 13 },

  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  navIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  navLabel: { flex: 1, fontSize: 15, fontWeight: '500' },

  version: { fontSize: 12, textAlign: 'center', marginTop: 12 },

  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 10 },
  errorText: { fontSize: 12, fontWeight: '600', flex: 1 },
});
