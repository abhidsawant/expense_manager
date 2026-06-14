import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ExpensesContext } from '../../state/ExpensesContext';
import { CategoriesContext } from '../../state/CategoriesContext';
import { SettingsContext } from '../../state/ThemeContext';
import { useTheme } from '../../theme/useTheme';
import { useResponsive } from '../../theme/useResponsive';

export default function ExpenseDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { state, dispatch } = useContext(ExpensesContext);
  const { categories } = useContext(CategoriesContext);
  const { settings } = useContext(SettingsContext);
  const theme = useTheme();
  const { rs, hPad } = useResponsive();
  const { t } = useTranslation();
  const [receiptVisible, setReceiptVisible] = useState(false);

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
      <View style={[styles.header, { borderBottomColor: theme.border, paddingHorizontal: hPad }]}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('expenseDetail.title')}</Text>
        <Pressable onPress={() => navigation.navigate('AddExpense', { expenseId: id })} style={[styles.iconBtn, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="pencil" size={18} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: hPad }]} showsVerticalScrollIndicator={false}>

        {/* Amount hero card */}
        <View style={[styles.amountCard, { backgroundColor: cat?.color ?? theme.primary, shadowColor: cat?.color ?? theme.shadow }]}>
          <View style={styles.amountCardTop}>
            <View style={styles.amountIconWrap}>
              <Ionicons name={(cat?.icon ?? 'ellipsis-horizontal') as any} size={26} color="#fff" />
            </View>
            <View style={[styles.catBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.catBadgeText}>{cat?.name}</Text>
            </View>
          </View>
          <Text style={[styles.amountText, { fontSize: rs(48, 34, 56) }]}>
            {settings.currency}{(expense.amount_cents / 100).toFixed(2)}
          </Text>
          <View style={styles.amountCardDivider} />
          <View style={styles.amountCardFooter}>
            <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.6)" />
            <Text style={styles.amountDate}>{format(parseISO(expense.spent_on), 'EEEE, MMMM d yyyy')}</Text>
          </View>
        </View>

        {/* Note */}
        {expense.note && (
          <View style={[styles.infoCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <View style={[styles.infoIconWrap, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="chatbubble-outline" size={16} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Note</Text>
              <Text style={[styles.noteText, { color: theme.text }]}>{expense.note}</Text>
            </View>
          </View>
        )}

        {/* Receipt */}
        {expense.receipt_uri && (
          <View style={[styles.receiptContainer, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <View style={styles.receiptHeader}>
              <View style={[styles.infoIconWrap, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="receipt-outline" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.infoLabel, { color: theme.textMuted, flex: 1 }]}>Receipt</Text>
              <Pressable onPress={() => setReceiptVisible(true)} style={[styles.expandBtn, { backgroundColor: theme.surface }]}>
                <Ionicons name="expand-outline" size={14} color={theme.primary} />
                <Text style={[styles.expandLabel, { color: theme.primary }]}>View</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => setReceiptVisible(true)}>
              <Image source={{ uri: expense.receipt_uri }} style={styles.receipt} contentFit="cover" />
            </Pressable>
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

      {/* Full-screen receipt viewer */}
      <Modal visible={receiptVisible} transparent animationType="fade" onRequestClose={() => setReceiptVisible(false)}>
        <View style={styles.lightbox}>
          <Pressable style={styles.lightboxClose} onPress={() => setReceiptVisible(false)}>
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
          <ScrollView
            maximumZoomScale={4}
            minimumZoomScale={1}
            centerContent
            contentContainerStyle={styles.lightboxContent}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <Image source={{ uri: expense.receipt_uri! }} style={styles.lightboxImage} contentFit="contain" />
          </ScrollView>
        </View>
      </Modal>
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
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { paddingTop: 20, gap: 14, paddingBottom: 48 },

  amountCard: {
    borderRadius: 28, padding: 24, gap: 8,
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 12,
  },
  amountCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  amountIconWrap: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  catBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  catBadgeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  amountText: { color: '#fff', fontWeight: '800', letterSpacing: -1, marginTop: 4 },
  amountCardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  amountCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  amountDate: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500' },

  infoCard: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 20, borderWidth: 1, alignItems: 'flex-start' },
  infoIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 },
  noteText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },

  receiptContainer: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  receiptHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  expandBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  expandLabel: { fontSize: 12, fontWeight: '700' },
  receipt: { width: '100%', height: 220 },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 16, borderRadius: 20, borderWidth: 1.5, marginTop: 4,
  },
  deleteLabel: { fontSize: 15, fontWeight: '700' },

  lightbox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.96)', justifyContent: 'center' },
  lightboxClose: {
    position: 'absolute', top: 52, right: 20, zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 13, padding: 10,
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
  },
  lightboxContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lightboxImage: { width: '100%', height: '100%' },
});
