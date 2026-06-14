import React, { useState, useContext, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, Pressable,
  KeyboardAvoidingView, Platform, Alert, ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ExpensesContext } from '../../state/ExpensesContext';
import { CategoriesContext } from '../../state/CategoriesContext';
import { SettingsContext } from '../../state/ThemeContext';
import { useTheme } from '../../theme/useTheme';
import { useResponsive } from '../../theme/useResponsive';
import { Button } from '../../components/Button';
import { Expense } from '../../types';
import CategoryPickerModal from './CategoryPickerModal';

function uuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export default function AddExpenseScreen({ route, navigation }: any) {
  const expenseId: string | undefined = route.params?.expenseId;
  const { state, dispatch } = useContext(ExpensesContext);
  const existing = expenseId ? state.expenses.find(e => e.id === expenseId) : undefined;
  const { categories } = useContext(CategoriesContext);
  const { settings } = useContext(SettingsContext);
  const theme = useTheme();
  const { rs, hPad } = useResponsive();
  const { t } = useTranslation();

  const [amount, setAmount] = useState(existing ? (existing.amount_cents / 100).toFixed(2) : '');
  const [categoryId, setCategoryId] = useState(existing?.category_id ?? '');
  const [date, setDate] = useState(existing ? parseISO(existing.spent_on) : new Date());
  const [note, setNote] = useState(existing?.note ?? '');
  const [receiptUri, setReceiptUri] = useState<string | null>(existing?.receipt_uri ?? null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const selectedCat = categories.find(c => c.id === categoryId);
  const isValid = parseFloat(amount) > 0 && categoryId.length > 0;

  async function pickReceipt() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [t('addExpense.takePhoto'), t('addExpense.chooseLibrary'), t('common.cancel')], cancelButtonIndex: 2 },
        async idx => { if (idx === 0) await capturePhoto(); if (idx === 1) await libraryPick(); }
      );
    } else {
      Alert.alert(t('addExpense.receiptSheet'), '', [
        { text: t('addExpense.takePhoto'), onPress: capturePhoto },
        { text: t('addExpense.chooseLibrary'), onPress: libraryPick },
        { text: t('common.cancel'), style: 'cancel' },
      ]);
    }
  }

  async function capturePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert(t('addExpense.cameraPermTitle'), t('addExpense.cameraPermMsg')); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) compressAndSet(result.assets[0].uri);
  }

  async function libraryPick() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!result.canceled) compressAndSet(result.assets[0].uri);
  }

  async function compressAndSet(uri: string) {
    const compressed = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 800 } }], { compress: 0.7 });
    setReceiptUri(compressed.uri);
  }

  function handleSave() {
    if (!isValid) return;
    const cents = Math.round(parseFloat(amount) * 100);
    if (existing) {
      dispatch({ type: 'UPDATE', payload: { ...existing, amount_cents: cents, category_id: categoryId, spent_on: format(date, 'yyyy-MM-dd'), note: note || null, receipt_uri: receiptUri } });
    } else {
      dispatch({ type: 'ADD', payload: { id: uuid(), amount_cents: cents, category_id: categoryId, spent_on: format(date, 'yyyy-MM-dd'), note: note || null, receipt_uri: receiptUri, created_at: new Date().toISOString() } as Expense });
    }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border, paddingHorizontal: hPad }]}>
          <Pressable onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
            <Ionicons name="close" size={20} color={theme.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>
            {existing ? t('addExpense.titleEdit') : t('addExpense.titleNew')}
          </Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={[styles.form, { paddingHorizontal: hPad }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Amount */}
          <View style={[styles.amountCard, { backgroundColor: selectedCat?.color ?? theme.primary, padding: rs(20, 14) }]}>
            <Text style={[styles.amountCurrencyLabel, { fontSize: rs(24, 18) }]}>{settings.currency}</Text>
            <TextInput
              style={[styles.amountInput, { fontSize: rs(38, 28, 44) }]}
              placeholder="0.00"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              autoFocus={!existing}
            />
          </View>

          {/* Category */}
          <Pressable
            onPress={() => setShowCatPicker(true)}
            style={({ pressed }) => [styles.row, { backgroundColor: theme.bgCard, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}
          >
            <View style={[styles.rowIconWrap, { backgroundColor: (selectedCat?.color ?? theme.primary) + '20' }]}>
              <Ionicons name={(selectedCat?.icon ?? 'grid-outline') as any} size={20} color={selectedCat?.color ?? theme.primary} />
            </View>
            <Text style={[styles.rowText, { color: selectedCat ? theme.text : theme.textMuted }]}>
              {selectedCat?.name ?? t('addExpense.selectCategory')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </Pressable>

          {/* Date */}
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={({ pressed }) => [styles.row, { backgroundColor: theme.bgCard, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}
          >
            <View style={[styles.rowIconWrap, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="calendar-outline" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.rowText, { color: theme.text }]}>{format(date, 'MMM d, yyyy')}</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(_, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setDate(d); }}
            />
          )}

          {/* Note */}
          <View style={[styles.noteWrap, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Ionicons name="pencil-outline" size={16} color={theme.textMuted} style={{ marginTop: 2 }} />
            <TextInput
              style={[styles.noteInput, { color: theme.text }]}
              placeholder={t('addExpense.notePlaceholder')}
              placeholderTextColor={theme.textMuted}
              value={note}
              onChangeText={txt => setNote(txt.slice(0, 200))}
              multiline
              maxLength={200}
              onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)}
            />
          </View>

          {/* Receipt */}
          <Pressable
            onPress={pickReceipt}
            style={[styles.receiptBtn, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
          >
            {receiptUri ? (
              <Image source={{ uri: receiptUri }} style={styles.receiptThumb} contentFit="cover" />
            ) : (
              <>
                <View style={[styles.receiptIcon, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="camera-outline" size={22} color={theme.primary} />
                </View>
                <Text style={[styles.receiptLabel, { color: theme.textSecondary }]}>{t('addExpense.addReceipt')}</Text>
              </>
            )}
          </Pressable>

          <Button
            label={existing ? t('addExpense.saveEdit') : t('addExpense.saveNew')}
            onPress={handleSave}
            disabled={!isValid}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <CategoryPickerModal
        visible={showCatPicker}
        selected={categoryId}
        onSelect={id => { setCategoryId(id); setShowCatPicker(false); }}
        onClose={() => setShowCatPicker(false)}
        onAddNew={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700' },
  form: { paddingHorizontal: 20, paddingTop: 20, gap: 12, paddingBottom: 48 },

  amountCard: { borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 4 },
  amountCurrencyLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 26, fontWeight: '700' },
  amountInput: { flex: 1, fontSize: 42, fontWeight: '800', color: '#fff', minWidth: 0 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, borderWidth: 1, padding: 16 },
  rowIconWrap: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, fontSize: 15, fontWeight: '600' },

  noteWrap: { flexDirection: 'row', gap: 10, borderRadius: 18, borderWidth: 1, padding: 16, alignItems: 'flex-start' },
  noteInput: { flex: 1, fontSize: 15, minHeight: 72, textAlignVertical: 'top' },

  receiptBtn: {
    borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed',
    padding: 24, alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 96,
  },
  receiptIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  receiptLabel: { fontSize: 14, fontWeight: '600' },
  receiptThumb: { width: '100%', height: 180, borderRadius: 14 },
  saveBtn: { marginTop: 6 },
});
