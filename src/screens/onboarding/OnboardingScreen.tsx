import React, { useState, useContext, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, Pressable, ScrollView, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../../state/ThemeContext';
import { useTheme } from '../../theme/useTheme';
import { useResponsive } from '../../theme/useResponsive';
import { Button } from '../../components/Button';
import { LANGUAGES } from '../../i18n';

export default function OnboardingScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');
  const [langOpen, setLangOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { dispatch } = useContext(SettingsContext);
  const theme = useTheme();
  const { rs, hPad, isSmall } = useResponsive();
  const { t, i18n } = useTranslation();

  function handleSelectLang(code: string) {
    setSelectedLang(code);
    i18n.changeLanguage(code);
  }

  function handleStart() {
    if (name.trim().length < 2) return;
    dispatch({ type: 'UPDATE', payload: { username: name.trim(), language: selectedLang } });
    navigation.replace('Tabs');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.container, { paddingHorizontal: hPad, paddingBottom: Platform.OS === 'ios' ? 48 : 120 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.blobTR, { backgroundColor: theme.primary }]} />
          <View style={[styles.blobBL, { backgroundColor: theme.accent }]} />

          {/* Hero */}
          <View style={styles.hero}>
            <View style={[styles.iconWrap, { backgroundColor: theme.primaryLight, width: rs(68, 52), height: rs(68, 52), borderRadius: rs(20, 14) }]}>
              <Text style={{ fontSize: rs(36, 26) }}>💸</Text>
            </View>
            <Text style={[styles.title, { color: theme.text, fontSize: rs(36, 28, 42) }]}>{t('onboarding.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary, fontSize: rs(16, 14, 18) }]}>{t('onboarding.subtitle')}</Text>
          </View>

          {/* Language Picker */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{t('settings.language')}</Text>
            <Pressable
              onPress={() => setLangOpen(true)}
              style={[styles.dropdown, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            >
              <Text style={{ fontSize: 20 }}>{LANGUAGES.find(l => l.code === selectedLang)?.flag}</Text>
              <Text style={[styles.dropdownText, { color: theme.text, fontSize: rs(15, 13) }]}>
                {LANGUAGES.find(l => l.code === selectedLang)?.label}
              </Text>
              <Text style={{ color: theme.textMuted }}>▾</Text>
            </Pressable>
            <Modal visible={langOpen} transparent animationType="fade" onRequestClose={() => setLangOpen(false)}>
              <Pressable style={styles.overlay} onPress={() => setLangOpen(false)}>
                <View style={[styles.dropdownMenu, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                  <FlatList
                    data={LANGUAGES}
                    keyExtractor={l => l.code}
                    renderItem={({ item }) => {
                      const isSelected = selectedLang === item.code;
                      return (
                        <Pressable
                          onPress={() => { handleSelectLang(item.code); setLangOpen(false); }}
                          style={[styles.dropdownItem, { backgroundColor: isSelected ? theme.primaryLight : 'transparent' }]}
                        >
                          <Text style={{ fontSize: 20 }}>{item.flag}</Text>
                          <Text style={[styles.dropdownText, { color: theme.text, fontSize: rs(15, 13) }]}>{item.label}</Text>
                          {isSelected ? <Text style={{ color: theme.primary }}>✓</Text> : null}
                        </Pressable>
                      );
                    }}
                  />
                </View>
              </Pressable>
            </Modal>
          </View>

          {/* Name form */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{t('onboarding.nameLabel')}</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.bgCard, borderColor: name.length > 0 ? theme.primary : theme.border }]}>
              <Text style={{ fontSize: isSmall ? 14 : 18 }}>👤</Text>
              <TextInput
                style={[styles.input, { color: theme.text, fontSize: rs(17, 14) }]}
                placeholder={t('onboarding.namePlaceholder')}
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
                maxLength={30}
                returnKeyType="done"
                onSubmitEditing={handleStart}
                onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)}
              />
              {name.length > 0 ? (
                <Pressable onPress={() => setName('')}>
                  <Text style={[styles.clearBtn, { color: theme.textMuted }]}>✕</Text>
                </Pressable>
              ) : null}
            </View>
            <Button label={t('onboarding.getStarted')} onPress={handleStart} disabled={name.trim().length < 2} style={styles.btn} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingTop: 28, gap: 28 },
  blobTR: { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, opacity: 0.18 },
  blobBL: { position: 'absolute', bottom: 80, left: -80, width: 200, height: 200, borderRadius: 100, opacity: 0.12 },
  hero: { gap: 12, alignItems: 'flex-start' },
  iconWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { fontWeight: '800', letterSpacing: -1 },
  subtitle: { lineHeight: 26, fontWeight: '400' },
  section: { gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  dropdown: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 14 },
  dropdownText: { flex: 1, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', paddingHorizontal: 32 },
  dropdownMenu: { borderRadius: 16, borderWidth: 1.5, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 4 },
  input: { flex: 1, fontWeight: '500', paddingVertical: 12 },
  clearBtn: { fontSize: 16, paddingHorizontal: 4 },
  btn: { marginTop: 4 },
});
