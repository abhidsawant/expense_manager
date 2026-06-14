import React, { useContext, useMemo, useCallback, useRef } from 'react';
import { View, Text, SectionList, Pressable, StyleSheet, RefreshControl, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ExpensesContext } from '../../state/ExpensesContext';
import { CategoriesContext } from '../../state/CategoriesContext';
import { SettingsContext } from '../../state/ThemeContext';
import { useTheme } from '../../theme/useTheme';
import { useResponsive } from '../../theme/useResponsive';
import { EmptyState } from '../../components/EmptyState';
import { Expense } from '../../types';

function groupByDay(expenses: Expense[]) {
  const map: Record<string, Expense[]> = {};
  [...expenses].sort((a, b) => b.spent_on.localeCompare(a.spent_on)).forEach(e => {
    if (!map[e.spent_on]) map[e.spent_on] = [];
    map[e.spent_on].push(e);
  });
  return Object.entries(map).map(([date, data]) => ({ title: date, data }));
}

export default function HomeScreen({ navigation }: any) {
  const { state } = useContext(ExpensesContext);
  const { categories } = useContext(CategoriesContext);
  const { settings } = useContext(SettingsContext);
  const theme = useTheme();
  const { rs, hPad } = useResponsive();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = React.useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    Animated.spring(fabAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }).start();
    return () => fabAnim.setValue(0);
  }, []));

  const sections = useMemo(() => groupByDay(state.expenses), [state.expenses]);
  const onRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 500); }, []);

  const monthTotal = useMemo(() => {
    const now = new Date();
    const start = format(startOfMonth(now), 'yyyy-MM-dd');
    const end = format(endOfMonth(now), 'yyyy-MM-dd');
    return state.expenses
      .filter(e => e.spent_on >= start && e.spent_on <= end)
      .reduce((s, e) => s + e.amount_cents, 0);
  }, [state.expenses]);

  const renderItem = useCallback(({ item }: { item: Expense }) => {
    const cat = categories.find(c => c.id === item.category_id);
    return (
      <Pressable
        onPress={() => navigation.navigate('ExpenseDetail', { id: item.id })}
        onLongPress={() => navigation.navigate('AddExpense', { expenseId: item.id })}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: theme.bgCard, borderColor: theme.border, opacity: pressed ? 0.75 : 1, shadowColor: theme.shadow },
        ]}
      >
        <View style={[styles.iconBadge, { backgroundColor: (cat?.color ?? theme.primary) + '22' }]}>
          <Ionicons name={(cat?.icon ?? 'ellipsis-horizontal') as any} size={22} color={cat?.color ?? theme.primary} />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.catName, { color: theme.text, fontSize: rs(15, 13) }]}>{cat?.name ?? 'Unknown'}</Text>
          {item.note
            ? <Text style={[styles.note, { color: theme.textMuted }]} numberOfLines={1}>{item.note}</Text>
            : <Text style={[styles.note, { color: theme.textMuted }]}>{format(parseISO(item.spent_on), 'MMM d')}</Text>
          }
        </View>
        <View style={styles.rowRight}>
          <Text style={[styles.amount, { color: theme.text, fontSize: rs(15, 13) }]}>
            {settings.currency}{(item.amount_cents / 100).toFixed(2)}
          </Text>
          {item.receipt_uri && (
            <Ionicons name="receipt-outline" size={11} color={theme.textMuted} />
          )}
        </View>
      </Pressable>
    );
  }, [categories, theme, settings.currency, rs]);

  const renderSectionHeader = useCallback(({ section: { title, data } }: any) => {
    const total = data.reduce((s: number, e: Expense) => s + e.amount_cents, 0);
    return (
      <View style={[styles.sectionHeader, { paddingHorizontal: hPad - 16 }]}>
        <Text style={[styles.sectionDate, { color: theme.textMuted }]}>{format(parseISO(title), 'EEE, MMM d')}</Text>
        <Text style={[styles.sectionTotal, { color: theme.textMuted }]}>
          {settings.currency}{(total / 100).toFixed(2)}
        </Text>
      </View>
    );
  }, [theme, settings.currency, hPad]);

  const ListHeader = (
    <View style={[styles.summaryCard, { backgroundColor: theme.primary, shadowColor: theme.shadow, marginHorizontal: 4 }]}>
      <View style={styles.summaryTop}>
        <View>
          <Text style={styles.summaryGreeting}>{t('home.greeting', { name: settings.username })}</Text>
          <Text style={styles.summaryLabel}>{format(new Date(), 'MMMM yyyy')}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('About')} style={styles.summaryInfoBtn}>
          <Ionicons name="information-circle-outline" size={20} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>
      <Text style={[styles.summaryAmount, { fontSize: rs(36, 28, 44) }]}>
        {settings.currency}{(monthTotal / 100).toFixed(2)}
      </Text>
      <View style={styles.summaryFooter}>
        <View style={styles.summaryStatItem}>
          <Ionicons name="layers-outline" size={13} color="rgba(255,255,255,0.6)" />
          <Text style={styles.summaryStatText}>{state.expenses.length} total expenses</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: hPad }]}>
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: rs(26, 22, 32) }]}>{t('home.title')}</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={[styles.list, { paddingHorizontal: hPad - 4 }, sections.length === 0 && styles.listEmpty]}
        ListEmptyComponent={<EmptyState message={t('home.empty')} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />

      <Animated.View style={[styles.fab, { bottom: Math.max(insets.bottom + 16, 28), shadowColor: theme.shadow, transform: [{ scale: fabAnim }] }]}>
        <Pressable onPress={() => navigation.navigate('AddExpense', {})} style={[styles.fabInner, { backgroundColor: theme.primary }]}>
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 10 },
  headerTitle: { fontWeight: '800', letterSpacing: -0.5 },
  list: { paddingBottom: 110, gap: 0 },
  listEmpty: { flex: 1 },

  summaryCard: {
    borderRadius: 24, padding: 22, marginBottom: 18, gap: 6,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  summaryGreeting: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500' },
  summaryLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 1 },
  summaryInfoBtn: { padding: 2 },
  summaryAmount: { color: '#fff', fontWeight: '800', letterSpacing: -1, marginTop: 4 },
  summaryFooter: { flexDirection: 'row', gap: 16, marginTop: 6 },
  summaryStatItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  summaryStatText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '500' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginTop: 4 },
  sectionDate: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  sectionTotal: { fontSize: 12, fontWeight: '600' },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, borderWidth: 1,
    padding: 14, marginBottom: 8,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  iconBadge: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 3 },
  catName: { fontWeight: '700' },
  note: { fontSize: 12 },
  rowRight: { alignItems: 'flex-end', gap: 3 },
  amount: { fontWeight: '700' },

  fab: {
    position: 'absolute', right: 24,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 12,
  },
  fabInner: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
});
