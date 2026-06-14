import React, { useContext, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { CategoriesContext } from '../../state/CategoriesContext';
import { useTheme } from '../../theme/useTheme';
import { useResponsive } from '../../theme/useResponsive';

const COLORS = ['#A855F7', '#22D3EE', '#EC4899', '#4ADE80', '#FACC15', '#F87171', '#60A5FA', '#FB923C', '#9CA3AF'];
const ICONS = ['restaurant', 'car', 'bag-handle', 'medkit', 'game-controller', 'receipt', 'home', 'airplane', 'school'];
function uuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

type Props = {
  visible: boolean;
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  onAddNew: () => void;
};

export default function CategoryPickerModal({ visible, selected, onSelect, onClose }: Props) {
  const { categories, dispatch } = useContext(CategoriesContext);
  const theme = useTheme();
  const { hPad, isTablet } = useResponsive();
  const { t } = useTranslation();

  const [showNewForm, setShowNewForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);

  function handleClose() {
    setShowNewForm(false);
    setName(''); setColor(COLORS[0]); setIcon(ICONS[0]);
    onClose();
  }

  function handleSaveNew() {
    if (!name.trim()) return;
    const newCat = { id: uuid(), name: name.trim(), color, icon, is_default: false };
    dispatch({ type: 'ADD', payload: newCat });
    onSelect(newCat.id);
    setShowNewForm(false);
    setName(''); setColor(COLORS[0]); setIcon(ICONS[0]);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.handle, { backgroundColor: theme.border }]} />

        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: hPad }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {showNewForm && (
              <Pressable onPress={() => setShowNewForm(false)} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
                <Ionicons name="arrow-back" size={16} color={theme.text} />
              </Pressable>
            )}
            <View>
              <Text style={[styles.title, { color: theme.text }]}>
                {showNewForm ? t('categories.newTitle') : t('categoryPicker.title')}
              </Text>
              {!showNewForm && (
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>{categories.length} categories</Text>
              )}
            </View>
          </View>
          <Pressable onPress={handleClose} style={[styles.closeBtn, { backgroundColor: theme.surface }]}>
            <Ionicons name="close" size={18} color={theme.text} />
          </Pressable>
        </View>

        {showNewForm ? (
          /* ── New Category Form ── */
          <ScrollView
            contentContainerStyle={[styles.form, { paddingHorizontal: hPad }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Live preview */}
            <View style={[styles.previewBadge, { backgroundColor: color + '18', borderColor: color }]}>
              <View style={[styles.previewIconWrap, { backgroundColor: color + '30' }]}>
                <Ionicons name={icon as any} size={26} color={color} />
              </View>
              <Text style={[styles.previewName, { color }]}>{name.trim() || 'Category Name'}</Text>
            </View>

            {/* Name */}
            <TextInput
              style={[styles.nameInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder={t('categories.namePlaceholder')}
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
            />

            {/* Color */}
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{t('categories.colorLabel')}</Text>
            <View style={styles.colorRow}>
              {COLORS.map(c => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[styles.colorSwatch, { backgroundColor: c, transform: [{ scale: color === c ? 1.2 : 1 }] }]}
                >
                  {color === c && <Ionicons name="checkmark" size={14} color="#fff" />}
                </Pressable>
              ))}
            </View>

            {/* Icon */}
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{t('categories.iconLabel')}</Text>
            <View style={styles.iconRow}>
              {ICONS.map(ic => (
                <Pressable
                  key={ic}
                  onPress={() => setIcon(ic)}
                  style={[styles.iconOpt, { backgroundColor: icon === ic ? color : theme.surface }]}
                >
                  <Ionicons name={ic as any} size={22} color={icon === ic ? '#fff' : theme.textSecondary} />
                </Pressable>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable
                onPress={() => setShowNewForm(false)}
                style={[styles.actionBtn, { backgroundColor: theme.surface, flex: 0.4 }]}
              >
                <Text style={[styles.actionBtnText, { color: theme.text }]}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveNew}
                style={[styles.actionBtn, { backgroundColor: color, flex: 0.6 }]}
              >
                <Text style={[styles.actionBtnText, { color: '#fff' }]}>{t('common.save')}</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : (
          /* ── Category Grid ── */
          <FlatList
            data={categories}
            numColumns={isTablet ? 4 : 3}
            key={isTablet ? 'tablet' : 'phone'}
            keyExtractor={c => c.id}
            contentContainerStyle={[styles.grid, { paddingHorizontal: hPad - 8 }]}
            renderItem={({ item }) => {
              const isSelected = item.id === selected;
              return (
                <Pressable
                  onPress={() => onSelect(item.id)}
                  style={({ pressed }) => [
                    styles.cell,
                    {
                      backgroundColor: isSelected ? item.color + '18' : theme.bgCard,
                      borderColor: isSelected ? item.color : theme.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: item.color + '22' }]}>
                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                  </View>
                  <Text style={[styles.cellLabel, { color: isSelected ? item.color : theme.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: item.color }]}>
                      <Ionicons name="checkmark" size={10} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            }}
            ListFooterComponent={
              <Pressable
                onPress={() => setShowNewForm(true)}
                style={({ pressed }) => [styles.addNew, { borderColor: theme.primary, backgroundColor: theme.primaryLight, opacity: pressed ? 0.8 : 1 }]}
              >
                <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
                <Text style={[styles.addNewLabel, { color: theme.primary }]}>{t('categoryPicker.addNew')}</Text>
              </Pressable>
            }
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  backBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  closeBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  grid: { paddingBottom: 48, gap: 10 },
  cell: { flex: 1, margin: 4, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', padding: 14, gap: 8 },
  iconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cellLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  checkBadge: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  addNew: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 4, padding: 16, borderRadius: 18, borderWidth: 1.5 },
  addNewLabel: { fontSize: 14, fontWeight: '700' },

  form: { gap: 14, paddingBottom: 48 },
  previewBadge: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, borderWidth: 1.5, padding: 14 },
  previewIconWrap: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  previewName: { fontSize: 16, fontWeight: '700' },
  nameInput: { borderRadius: 16, borderWidth: 1.5, padding: 15, fontSize: 16, fontWeight: '600' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconOpt: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  actionBtn: { padding: 16, borderRadius: 18, alignItems: 'center' },
  actionBtnText: { fontSize: 16, fontWeight: '700' },
});
