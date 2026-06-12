import React, { useContext, useMemo, useCallback, useRef } from 'react';
import { View, Text, SectionList, Pressable, StyleSheet, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ExpensesContext } from '../../state/ExpensesContext';
import { CategoriesContext } from '../../state/CategoriesContext';
import { SettingsContext } from '../../state/ThemeContext';
import { useTheme } from '../../theme/useTheme';
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
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = React.useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    Animated.spring(fabAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }).start();
    return () => fabAnim.setValue(0);
  }, []));

  const sections = useMemo(() => groupByDay(state.expenses), [state.expenses]);
  const onRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 500); }, []);

  const renderItem = useCallback(({ item }: { item: Expense }) => {
    const cat = categories.find(c => c.id === item.category_id);
    return (
      <Pressable
        onPress={() => navigation.navigate('ExpenseDetail', { id: item.id })}
        onLongPress={() => navigation.navigate('AddExpense', { expenseId: item.id })}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: theme.bgCard,
            borderColor: theme.border,
            opacity: pressed ? 0.75 : 1,
            shadowColor: theme.shadow,
          },
        ]}
      >
        <View style={[styles.iconBadge, { backgroundColor: (cat?.color ?? theme.primary) + '20' }]}>
          <Ionicons name={(cat?.icon ?? 'ellipsis-horizontal') as any} size={22} color={cat?.color ?? theme.primary} />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.catName, { color: theme.text }]}>{cat?.name ?? 'Unknown'}</Text>
          {item.note
            ? <Text style={[styles.note, { color: theme.textMuted }]} numberOfLines={1}>{item.note}</Text>
            : null}
        </View>
        <View style={[styles.amountBadge, { backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.amount, { color: theme.primary }]}>
            {settings.currency}{(item.amount_cents / 100).toFixed(2)}
          </Text>
        </View>
      </Pressable>
    );
  }, [categories, theme, settings.currency]);

  const renderSectionHeader = useCallback(({ section: { title, data } }: any) => {
    const total = data.reduce((s: number, e: Expense) => s + e.amount_cents, 0);
    return (
      <View style={[styles.sectionHeader, { backgroundColor: theme.bg }]}>
        <Text style={[styles.sectionDate, { color: theme.textSecondary }]}>
          {format(parseISO(title), 'EEE, MMM d')}
        </Text>
        <View style={[styles.sectionTotalBadge, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTotal, { color: theme.textSecondary }]}>
            {settings.currency}{(total / 100).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  }, [theme, settings.currency]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.textMuted }]}>
            {t('home.greeting', { name: settings.username })}
          </Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t('home.title')}</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Stats')}
          style={[styles.headerBtn, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
        >
          <Ionicons name="stats-chart" size={18} color={theme.primary} />
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={[styles.list, sections.length === 0 && styles.listEmpty]}
        ListEmptyComponent={<EmptyState message={t('home.empty')} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Animated.View style={[styles.fab, { transform: [{ scale: fabAnim }], shadowColor: theme.shadow }]}>
        <Pressable
          onPress={() => navigation.navigate('AddExpense', {})}
          style={[styles.fabInner, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  greeting: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  headerTitle: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  list: { paddingHorizontal: 16, paddingBottom: 110 },
  listEmpty: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 4, marginTop: 6,
  },
  sectionDate: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  sectionTotalBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  sectionTotal: { fontSize: 12, fontWeight: '600' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 8,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  iconBadge: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  catName: { fontSize: 15, fontWeight: '600' },
  note: { fontSize: 12 },
  amountBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  amount: { fontSize: 14, fontWeight: '700' },
  fab: {
    position: 'absolute', bottom: 28, right: 24,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 12,
  },
  fabInner: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
});
