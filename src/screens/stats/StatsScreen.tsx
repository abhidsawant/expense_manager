import React, { useContext, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ExpensesContext } from '../../state/ExpensesContext';
import { CategoriesContext } from '../../state/CategoriesContext';
import { SettingsContext } from '../../state/ThemeContext';
import { useTheme } from '../../theme/useTheme';
import { useResponsive } from '../../theme/useResponsive';
import { EmptyState } from '../../components/EmptyState';

export default function StatsScreen() {
  const { state } = useContext(ExpensesContext);
  const { categories } = useContext(CategoriesContext);
  const { settings } = useContext(SettingsContext);
  const theme = useTheme();
  const { rs, hPad, isSmall } = useResponsive();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());

  function shiftMonth(dir: 1 | -1) {
    setSelectedDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + dir); return d; });
  }

  const { total, byCat, txCount, avgPerDay } = useMemo(() => {
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
    const daysInMonth = endOfMonth(selectedDate).getDate();
    return { total, byCat, txCount: filtered.length, avgPerDay: total / daysInMonth };
  }, [state.expenses, categories, selectedDate]);

  const isCurrentMonth = format(selectedDate, 'yyyy-MM') >= format(new Date(), 'yyyy-MM');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: hPad }]}>
        <Text style={[styles.title, { color: theme.text, fontSize: rs(26, 22, 32) }]}>{t('stats.title')}</Text>
      </View>

      {/* Month Navigator */}
      <View style={[styles.monthRow, { backgroundColor: theme.bgCard, borderColor: theme.border, marginHorizontal: hPad }]}>
        <Pressable onPress={() => shiftMonth(-1)} style={styles.arrowBtn}>
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
        </Pressable>
        <Text style={[styles.monthLabel, { color: theme.text, fontSize: rs(15, 13) }]}>{format(selectedDate, 'MMMM yyyy')}</Text>
        <Pressable onPress={() => shiftMonth(1)} style={styles.arrowBtn} disabled={isCurrentMonth}>
          <Ionicons name="chevron-forward" size={20} color={isCurrentMonth ? theme.textMuted : theme.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: hPad }, byCat.length === 0 && styles.emptyContent]}
        showsVerticalScrollIndicator={false}
      >
        {byCat.length === 0 ? (
          <EmptyState message={t('stats.empty')} />
        ) : (
          <>
            {/* Total Card */}
            <View style={[styles.totalCard, { backgroundColor: theme.primary, shadowColor: theme.shadow, padding: isSmall ? 18 : 24 }]}>
              <Text style={styles.totalLabel}>{t('stats.totalSpent')}</Text>
              <Text style={[styles.totalAmount, { fontSize: rs(40, 28, 48) }]}>
                {settings.currency}{(total / 100).toFixed(2)}
              </Text>
              <View style={styles.totalDivider} />
              {/* Mini stats row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="receipt-outline" size={14} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.statValue}>{txCount}</Text>
                  <Text style={styles.statLabel}>transactions</Text>
                </View>
                <View style={[styles.statDivider]} />
                <View style={styles.statItem}>
                  <Ionicons name="trending-up-outline" size={14} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.statValue}>{settings.currency}{(avgPerDay / 100).toFixed(0)}</Text>
                  <Text style={styles.statLabel}>avg / day</Text>
                </View>
                <View style={[styles.statDivider]} />
                <View style={styles.statItem}>
                  <Ionicons name="grid-outline" size={14} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.statValue}>{byCat.length}</Text>
                  <Text style={styles.statLabel}>categories</Text>
                </View>
              </View>
            </View>

            {/* Category Breakdown */}
            {byCat.map(({ cat, amount, percent }, idx) => (
              <View key={cat?.id ?? 'unknown'} style={[styles.barCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <View style={styles.barHeader}>
                  <View style={[styles.barRank, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.barRankText, { color: theme.textMuted }]}>#{idx + 1}</Text>
                  </View>
                  <View style={[styles.barIconWrap, { backgroundColor: (cat?.color ?? theme.primary) + '22' }]}>
                    <Ionicons name={(cat?.icon ?? 'ellipsis-horizontal') as any} size={16} color={cat?.color ?? theme.primary} />
                  </View>
                  <Text style={[styles.barCatName, { color: theme.text, fontSize: rs(14, 12) }]}>{cat?.name ?? 'Unknown'}</Text>
                  <Text style={[styles.barAmount, { color: theme.text, fontSize: rs(14, 12) }]}>
                    {settings.currency}{(amount / 100).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.barTrackRow}>
                  <View style={[styles.barTrack, { backgroundColor: theme.surface, flex: 1 }]}>
                    <View style={[styles.barFill, { width: `${percent}%` as any, backgroundColor: cat?.color ?? theme.primary }]} />
                  </View>
                  <Text style={[styles.barPercent, { color: cat?.color ?? theme.primary }]}>{percent.toFixed(0)}%</Text>
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
  header: { paddingTop: 8, paddingBottom: 8 },
  title: { fontWeight: '800', letterSpacing: -0.5 },

  monthRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 16, marginBottom: 16, borderWidth: 1,
  },
  arrowBtn: { padding: 12 },
  monthLabel: { fontWeight: '700' },

  content: { paddingBottom: 48, gap: 12 },
  emptyContent: { flex: 1 },

  totalCard: {
    borderRadius: 24, gap: 4,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  totalLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  totalAmount: { color: '#fff', fontWeight: '800', letterSpacing: -1, marginTop: 2 },
  totalDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 14 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.15)' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '500' },

  barCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  barHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barRank: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  barRankText: { fontSize: 10, fontWeight: '700' },
  barIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  barCatName: { flex: 1, fontWeight: '700' },
  barAmount: { fontWeight: '700' },
  barTrackRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  barPercent: { fontSize: 13, fontWeight: '800', minWidth: 36, textAlign: 'right' },
});
