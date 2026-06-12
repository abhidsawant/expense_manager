import React, { useContext, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ExpensesContext } from '../../state/ExpensesContext';
import { CategoriesContext } from '../../state/CategoriesContext';
import { SettingsContext } from '../../state/ThemeContext';
import { useTheme } from '../../theme/useTheme';
import { EmptyState } from '../../components/EmptyState';

export default function StatsScreen() {
  const { state } = useContext(ExpensesContext);
  const { categories } = useContext(CategoriesContext);
  const { settings } = useContext(SettingsContext);
  const theme = useTheme();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());

  function shiftMonth(dir: 1 | -1) {
    setSelectedDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + dir); return d; });
  }

  const { total, byCat } = useMemo(() => {
    const start = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
    const filtered = state.expenses.filter(e => e.spent_on >= start && e.spent_on <= end);
    const total = filtered.reduce((s, e) => s + e.amount_cents, 0);
    const map: Record<string, number> = {};
    filtered.forEach(e => { map[e.category_id] = (map[e.category_id] ?? 0) + e.amount_cents; });
    const byCat = Object.entries(map).map(([id, amount]) => ({
      cat: categories.find(c => c.id === id), amount,
      percent: total > 0 ? (amount / total) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);
    return { total, byCat };
  }, [state.expenses, categories, selectedDate]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('stats.title')}</Text>
      </View>

      {/* Month switcher */}
      <View style={[styles.monthRow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Pressable onPress={() => shiftMonth(-1)} style={styles.arrowBtn}>
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
        </Pressable>
        <Text style={[styles.monthLabel, { color: theme.text }]}>{format(selectedDate, 'MMMM yyyy')}</Text>
        <Pressable
          onPress={() => shiftMonth(1)}
          style={styles.arrowBtn}
          disabled={format(selectedDate, 'yyyy-MM') >= format(new Date(), 'yyyy-MM')}
        >
          <Ionicons name="chevron-forward" size={20} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, byCat.length === 0 && styles.emptyContent]}
        showsVerticalScrollIndicator={false}
      >
        {byCat.length === 0 ? (
          <EmptyState message={t('stats.empty')} />
        ) : (
          <>
            {/* Total card */}
            <View style={[styles.totalCard, { backgroundColor: theme.primary, shadowColor: theme.shadow }]}>
              <Text style={styles.totalLabel}>{t('stats.totalSpent')}</Text>
              <Text style={styles.totalAmount}>{settings.currency}{(total / 100).toFixed(2)}</Text>
              <Text style={styles.totalMonth}>{format(selectedDate, 'MMMM yyyy')}</Text>
            </View>

            {/* Category bars */}
            {byCat.map(({ cat, amount, percent }) => (
              <View key={cat?.id ?? 'unknown'} style={[styles.barCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <View style={styles.barHeader}>
                  <View style={[styles.barIconWrap, { backgroundColor: (cat?.color ?? theme.primary) + '20' }]}>
                    <Ionicons name={(cat?.icon ?? 'ellipsis-horizontal') as any} size={16} color={cat?.color ?? theme.primary} />
                  </View>
                  <Text style={[styles.barCatName, { color: theme.text }]}>{cat?.name ?? 'Unknown'}</Text>
                  <Text style={[styles.barAmount, { color: theme.textSecondary }]}>
                    {settings.currency}{(amount / 100).toFixed(2)}
                  </Text>
                  <View style={[styles.barPercentBadge, { backgroundColor: (cat?.color ?? theme.primary) + '20' }]}>
                    <Text style={[styles.barPercent, { color: cat?.color ?? theme.primary }]}>{percent.toFixed(0)}%</Text>
                  </View>
                </View>
                <View style={[styles.barTrack, { backgroundColor: theme.surface }]}>
                  <View style={[styles.barFill, { width: `${percent}%` as any, backgroundColor: cat?.color ?? theme.primary }]} />
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  monthRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1,
  },
  arrowBtn: { padding: 12 },
  monthLabel: { fontSize: 15, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingBottom: 48, gap: 12 },
  emptyContent: { flex: 1 },
  totalCard: {
    borderRadius: 24, padding: 24, gap: 4,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
  },
  totalLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  totalAmount: { color: '#fff', fontSize: 44, fontWeight: '800', letterSpacing: -1 },
  totalMonth: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  barCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  barHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barIconWrap: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  barCatName: { flex: 1, fontSize: 14, fontWeight: '600' },
  barAmount: { fontSize: 13, fontWeight: '500' },
  barPercentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  barPercent: { fontSize: 12, fontWeight: '700' },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
});
