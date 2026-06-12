import React, { useContext } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ExpensesContext } from '../../state/ExpensesContext';
import { CategoriesContext } from '../../state/CategoriesContext';
import { SettingsContext } from '../../state/ThemeContext';
import { useTheme } from '../../theme/useTheme';

export default function ExpenseDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { state, dispatch } = useContext(ExpensesContext);
  const { categories } = useContext(CategoriesContext);
  const { settings } = useContext(SettingsContext);
  const theme = useTheme();
  const { t } = useTranslation();

  const expense = state.expenses.find(e => e.id === id);
  if (!expense) return null;
  const cat = categories.find(c => c.id === expense.category_id);

  function handleDelete() {
    Alert.alert(t('expenseDetail.deleteTitle'), t('expenseDetail.deleteMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => { dispatch({ type: 'DELETE', payload: id }); navigation.goBack(); } },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('expenseDetail.title')}</Text>
        <Pressable onPress={() => navigation.navigate('AddExpense', { expenseId: id })} style={[styles.iconBtn, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="pencil" size={18} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount hero card */}
        <View style={[styles.amountCard, { backgroundColor: cat?.color ?? theme.primary }]}>
          <View style={styles.amountCardInner}>
            <View style={styles.amountIconWrap}>
              <Ionicons name={(cat?.icon ?? 'ellipsis-horizontal') as any} size={28} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.amountCat}>{cat?.name}</Text>
              <Text style={styles.amountDate}>{format(parseISO(expense.spent_on), 'EEEE, MMMM d yyyy')}</Text>
            </View>
          </View>
          <Text style={styles.amountText}>{settings.currency}{(expense.amount_cents / 100).toFixed(2)}</Text>
        </View>

        {/* Note */}
        {expense.note && (
          <View style={[styles.infoCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <View style={[styles.infoIcon, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="chatbubble-outline" size={16} color={theme.primary} />
            </View>
            <Text style={[styles.noteText, { color: theme.text }]}>{expense.note}</Text>
          </View>
        )}

        {/* Receipt */}
        {expense.receipt_uri && (
          <View style={[styles.receiptWrap, { borderColor: theme.border }]}>
            <Image source={{ uri: expense.receipt_uri }} style={styles.receipt} contentFit="cover" />
          </View>
        )}

        {/* Delete */}
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.deleteBtn,
            { backgroundColor: theme.dangerLight, borderColor: theme.danger, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="trash-outline" size={18} color={theme.danger} />
          <Text style={[styles.deleteLabel, { color: theme.danger }]}>{t('expenseDetail.deleteTitle')}</Text>
        </Pressable>
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
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingTop: 20, gap: 14, paddingBottom: 48 },

  amountCard: { borderRadius: 24, padding: 22, gap: 12 },
  amountCardInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  amountIconWrap: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  amountCat: { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '700' },
  amountDate: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  amountText: { color: '#fff', fontSize: 44, fontWeight: '800', letterSpacing: -1 },

  infoCard: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'flex-start' },
  infoIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  noteText: { flex: 1, fontSize: 15, lineHeight: 22 },

  receiptWrap: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  receipt: { width: '100%', height: 220 },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 15, borderRadius: 16, borderWidth: 1.5,
  },
  deleteLabel: { fontSize: 15, fontWeight: '600' },
});
