import React, { useContext, useState } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, Alert, Modal,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { CategoriesContext } from '../../state/CategoriesContext';
import { ExpensesContext } from '../../state/ExpensesContext';
import { useTheme } from '../../theme/useTheme';
import { useResponsive } from '../../theme/useResponsive';
import { Category } from '../../types';
import ColorPicker from '../../components/ColorPicker';

const COLORS = ['#A855F7', '#22D3EE', '#EC4899', '#4ADE80', '#FACC15', '#F87171', '#60A5FA', '#FB923C', '#9CA3AF'];
const ICONS = ['restaurant', 'car', 'bag-handle', 'medkit', 'game-controller', 'receipt', 'home', 'airplane', 'school'];
function uuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export default function ManageCategoriesScreen({ navigation }: any) {
  const { categories, dispatch } = useContext(CategoriesContext);
  const { state: expState } = useContext(ExpensesContext);
  const theme = useTheme();
  const { rs, hPad } = useResponsive();
  const { t } = useTranslation();
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  function openAdd() { setEditing({ name: '', color: COLORS[0], icon: ICONS[0] }); setIsNew(true); setShowPicker(false); }
  function openEdit(cat: Category) { setEditing({ ...cat }); setIsNew(false); setShowPicker(false); }

  function handleSave() {
    if (!editing?.name?.trim()) return;
    if (isNew) {
      dispatch({ type: 'ADD', payload: { id: uuid(), name: editing.name!, color: editing.color!, icon: editing.icon!, is_default: false } });
    } else {
      dispatch({ type: 'UPDATE', payload: editing as Category });
    }
    setEditing(null);
  }

  function handleDelete(cat: Category) {
    const inUse = expState.expenses.some(e => e.category_id === cat.id);
    if (inUse) {
      Alert.alert(t('categories.cannotDelete'), t('categories.inUseMsg', { name: cat.name }));
      return;
    }
    Alert.alert(t('categories.deleteTitle'), t('categories.deleteMsg', { name: cat.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => dispatch({ type: 'DELETE', payload: cat.id }) },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingHorizontal: hPad }]}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text, fontSize: rs(20, 17, 24) }]}>{t('categories.title')}</Text>
        <Pressable onPress={openAdd} style={[styles.addBtn, { backgroundColor: theme.primary }]}>
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={categories}
        keyExtractor={c => c.id}
        contentContainerStyle={[styles.list, { paddingHorizontal: hPad }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openEdit(item)}
            onLongPress={() => handleDelete(item)}
            style={({ pressed }) => [styles.row, { backgroundColor: theme.bgCard, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}
          >
            <View style={[styles.iconBadge, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={[styles.catName, { color: theme.text }]}>{item.name}</Text>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Ionicons name="chevron-forward" size={15} color={theme.textMuted} />
          </Pressable>
        )}
      />

      <Modal visible={editing !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditing(null)}>
        <KeyboardAvoidingView
          style={[styles.modalOuter, { backgroundColor: theme.bg }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={[styles.modal, { paddingHorizontal: hPad }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {isNew ? t('categories.newTitle') : t('categories.editTitle')}
              </Text>
              <Pressable onPress={() => setEditing(null)} style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
                <Ionicons name="close" size={18} color={theme.text} />
              </Pressable>
            </View>

            {/* Preview badge */}
            <View style={[styles.previewBadge, { backgroundColor: (editing?.color ?? COLORS[0]) + '18', borderColor: editing?.color ?? COLORS[0] }]}>
              <View style={[styles.previewIconWrap, { backgroundColor: (editing?.color ?? COLORS[0]) + '30' }]}>
                <Ionicons name={(editing?.icon ?? ICONS[0]) as any} size={28} color={editing?.color ?? COLORS[0]} />
              </View>
              <Text style={[styles.previewName, { color: editing?.color ?? COLORS[0] }]}>
                {editing?.name?.trim() || 'Category Name'}
              </Text>
            </View>

            {/* Name input */}
            <TextInput
              style={[styles.nameInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder={t('categories.namePlaceholder')}
              placeholderTextColor={theme.textMuted}
              value={editing?.name ?? ''}
              onChangeText={txt => setEditing(prev => ({ ...prev, name: txt }))}
              autoFocus
            />

            {/* Color */}
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{t('categories.colorLabel')}</Text>
            <View style={styles.colorRow}>
              {COLORS.map(c => (
                <Pressable
                  key={c}
                  onPress={() => { setEditing(prev => ({ ...prev, color: c })); setShowPicker(false); }}
                  style={[styles.colorSwatch, { backgroundColor: c, transform: [{ scale: editing?.color === c ? 1.2 : 1 }] }]}
                >
                  {editing?.color === c && <Ionicons name="checkmark" size={14} color="#fff" />}
                </Pressable>
              ))}
              <Pressable
                onPress={() => setShowPicker(p => !p)}
                style={[styles.colorSwatch, styles.customSwatch, {
                  borderColor: showPicker ? theme.primary : theme.border,
                  backgroundColor: showPicker ? theme.primaryLight : theme.surface,
                }]}
              >
                <Ionicons name="color-palette-outline" size={16} color={showPicker ? theme.primary : theme.textMuted} />
              </Pressable>
            </View>

            {showPicker && (
              <View style={[styles.pickerCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <ColorPicker
                  color={editing?.color ?? COLORS[0]}
                  onChange={hex => setEditing(prev => ({ ...prev, color: hex }))}
                />
                <Pressable
                  onPress={() => setShowPicker(false)}
                  style={[styles.doneBtn, { backgroundColor: editing?.color ?? COLORS[0] }]}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.doneBtnText}>Done</Text>
                </Pressable>
              </View>
            )}

            {/* Icon */}
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{t('categories.iconLabel')}</Text>
            <View style={styles.iconRow}>
              {ICONS.map(ic => {
                const isActive = editing?.icon === ic;
                return (
                  <Pressable
                    key={ic}
                    onPress={() => setEditing(prev => ({ ...prev, icon: ic }))}
                    style={[styles.iconOpt, { backgroundColor: isActive ? (editing?.color ?? theme.primary) : theme.surface }]}
                  >
                    <Ionicons name={ic as any} size={22} color={isActive ? '#fff' : theme.textSecondary} />
                  </Pressable>
                );
              })}
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setEditing(null)}
                style={[styles.modalBtn, { backgroundColor: theme.surface, flex: 0.4 }]}
              >
                <Text style={[styles.modalBtnText, { color: theme.text }]}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                style={[styles.modalBtn, { backgroundColor: editing?.color ?? theme.primary, flex: 0.6 }]}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t('common.save')}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', letterSpacing: -0.3 },
  addBtn: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  list: { gap: 8, paddingBottom: 40 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 18, borderWidth: 1, padding: 14,
  },
  iconBadge: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  catName: { flex: 1, fontSize: 15, fontWeight: '700' },
  colorPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  colorDot: { width: 8, height: 8, borderRadius: 4 },
  colorHex: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  modalOuter: { flex: 1 },
  modal: { paddingTop: 8, gap: 14, paddingBottom: 48 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },

  previewBadge: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, borderWidth: 1.5, padding: 14 },
  previewIconWrap: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  previewName: { fontSize: 16, fontWeight: '700' },

  nameInput: { borderRadius: 16, borderWidth: 1.5, padding: 15, fontSize: 16, fontWeight: '600' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  customSwatch: { borderWidth: 1.5 },

  pickerCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 14 },
  doneBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 14 },
  doneBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconOpt: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  modalActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  modalBtn: { padding: 16, borderRadius: 18, alignItems: 'center' },
  modalBtnText: { fontSize: 16, fontWeight: '700' },
});
