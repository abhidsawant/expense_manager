import React, { useState, useContext, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, Pressable, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../../state/ThemeContext';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../../components/Button';
import { LANGUAGES } from '../../i18n';

export default function OnboardingScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');
  const scrollRef = useRef<ScrollView>(null);
  const { dispatch } = useContext(SettingsContext);
  const theme = useTheme();
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
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Decorative blobs */}
          <View style={[styles.blobTR, { backgroundColor: theme.primary }]} />
          <View style={[styles.blobBL, { backgroundColor: theme.accent }]} />

          {/* Hero */}
          <View style={styles.hero}>
            <View style={[styles.iconWrap, { backgroundColor: theme.primaryLight }]}>
              <Text style={styles.emoji}>💸</Text>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>{t('onboarding.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('onboarding.subtitle')}</Text>
          </View>

          {/* Language Picker */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{t('settings.language')}</Text>
            <View style={styles.langGrid}>
              {LANGUAGES.map(lang => {
                const isSelected = selectedLang === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => handleSelectLang(lang.code)}
                    style={({ pressed }) => [
                      styles.langCard,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.bgCard,
                        borderColor: isSelected ? theme.primary : theme.border,
                        opacity: pressed ? 0.8 : 1,
                        shadowColor: isSelected ? theme.shadow : 'transparent',
                      },
                    ]}
                  >
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <Text style={[styles.langLabel, { color: isSelected ? '#fff' : theme.text }]}>
                      {lang.label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Name form */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{t('onboarding.nameLabel')}</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.bgCard, borderColor: name.length > 0 ? theme.primary : theme.border }]}>
              <Text style={styles.inputEmoji}>👤</Text>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={t('onboarding.namePlaceholder')}
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
                maxLength={30}
                returnKeyType="done"
                onSubmitEditing={handleStart}
                onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)}
              />
              {name.length > 0 && (
                <Pressable onPress={() => setName('')}>
                  <Text style={[styles.clearBtn, { color: theme.textMuted }]}>✕</Text>
                </Pressable>
              )}
            </View>

            <Button
              label={t('onboarding.getStarted')}
              onPress={handleStart}
              disabled={name.trim().length < 2}
              style={styles.btn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48, gap: 32 },

  blobTR: { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, opacity: 0.18 },
  blobBL: { position: 'absolute', bottom: 80, left: -80, width: 200, height: 200, borderRadius: 100, opacity: 0.12 },

  hero: { gap: 12, alignItems: 'flex-start' },
  iconWrap: { width: 68, height: 68, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emoji: { fontSize: 36 },
  title: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  subtitle: { fontSize: 18, lineHeight: 28, fontWeight: '400' },

  section: { gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },

  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  langCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 14, borderWidth: 1.5,
    minWidth: '47%', flex: 1,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  langFlag: { fontSize: 20 },
  langLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
  checkBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#fff', fontSize: 11, fontWeight: '700' },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 4,
  },
  inputEmoji: { fontSize: 18 },
  input: { flex: 1, fontSize: 17, fontWeight: '500', paddingVertical: 12 },
  clearBtn: { fontSize: 16, paddingHorizontal: 4 },
  btn: { marginTop: 4 },
});
