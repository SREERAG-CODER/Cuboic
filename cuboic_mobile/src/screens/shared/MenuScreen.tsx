import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    Modal, TextInput, Switch, Alert, ActivityIndicator,
    ScrollView, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { menuApi, type MenuItem, type Category } from '../../api/menu';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { COLORS, S } from '../../theme';
import { useNavigation } from '@react-navigation/native';

const EMPTY_FORM = {
    name: '',
    description: '',
    price: '',
    image_url: '',
    categoryId: '',
    is_available: true,
};

type FormState = typeof EMPTY_FORM;

export function MenuScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const restaurantId = user?.restaurantId ?? '';

    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCat, setFilterCat] = useState('all');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        if (!restaurantId) return;
        try {
            const [itemsData, catsData] = await Promise.all([
                menuApi.getAll(restaurantId),
                menuApi.getCategories(restaurantId),
            ]);
            setItems(itemsData);
            setCategories(catsData);
        } catch {
            Alert.alert('Error', 'Failed to load menu');
        }
    }, [restaurantId]);

    useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

    const toggleAvailability = async (item: MenuItem) => {
        try {
            await menuApi.updateItem(item.id, { is_available: !item.is_available });
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !item.is_available } : i));
        } catch {
            Alert.alert('Error', 'Could not update availability');
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? '' });
        setModalOpen(true);
    };

    const openEditModal = (item: MenuItem) => {
        setEditingId(item.id);
        setForm({
            name: item.name,
            description: item.description ?? '',
            price: String(item.price),
            image_url: item.image_url ?? '',
            categoryId: item.categoryId,
            is_available: item.is_available,
        });
        setModalOpen(true);
    };

    const closeModal = () => { setModalOpen(false); setEditingId(null); };

    const handleSave = async () => {
        if (!form.name.trim()) { Alert.alert('Validation', 'Name is required'); return; }
        const price = parseFloat(form.price);
        if (isNaN(price) || price < 0) { Alert.alert('Validation', 'Enter a valid price'); return; }
        if (!form.categoryId) { Alert.alert('Validation', 'Select a category'); return; }

        setSaving(true);
        try {
            if (editingId) {
                const updated = await menuApi.updateItem(editingId, {
                    name: form.name.trim(),
                    description: form.description.trim() || undefined,
                    price,
                    image_url: form.image_url.trim() || undefined,
                    categoryId: form.categoryId,
                    is_available: form.is_available,
                });
                setItems(prev => prev.map(i => i.id === editingId ? updated : i));
                Alert.alert('Saved', `"${updated.name}" updated`);
            } else {
                const created = await menuApi.createItem({
                    restaurantId,
                    categoryId: form.categoryId,
                    name: form.name.trim(),
                    description: form.description.trim() || undefined,
                    price,
                    image_url: form.image_url.trim() || undefined,
                    is_available: form.is_available,
                });
                setItems(prev => [...prev, created]);
                Alert.alert('Created', `"${created.name}" added to menu`);
            }
            closeModal();
        } catch {
            Alert.alert('Error', 'Failed to save item');
        } finally {
            setSaving(false);
        }
    };

    const getCategoryName = (id: string) =>
        categories.find(c => c.id === id || String(c.id) === id)?.name ?? '—';

    const visibleItems = filterCat === 'all'
        ? items
        : items.filter(i => i.categoryId === filterCat || String(i.categoryId) === filterCat);

    if (loading) return (
        <View style={S.screen}>
            <ActivityIndicator style={{ marginTop: 80 }} color={COLORS.accent} size="large" />
        </View>
    );

    return (
        <View style={S.screen}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={20} color={COLORS.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>Menu</Text>
                        <Text style={styles.sub}>{items.length} items · {items.filter(i => !i.is_available).length} unavailable</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.8}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {/* Category filter tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabsContainer}
                contentContainerStyle={styles.tabsContent}
            >
                <TouchableOpacity
                    style={[styles.tab, filterCat === 'all' && styles.tabActive]}
                    onPress={() => setFilterCat('all')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, filterCat === 'all' && styles.tabTextActive]}>
                        All ({items.length})
                    </Text>
                </TouchableOpacity>
                {categories.map(cat => {
                    const count = items.filter(i => i.categoryId === cat.id || String(i.categoryId) === cat.id).length;
                    return (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.tab, filterCat === cat.id && styles.tabActive]}
                            onPress={() => setFilterCat(cat.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabText, filterCat === cat.id && styles.tabTextActive]}>
                                {cat.name} ({count})
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <FlatList
                data={visibleItems}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={[styles.card, !item.is_available && styles.cardUnavailable]}>
                        <View style={styles.cardMain}>
                            {item.image_url ? (
                                <Image
                                    source={{ uri: item.image_url }}
                                    style={styles.thumb}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.thumbPlaceholder}>
                                    <Feather name="image" size={24} color={COLORS.textDim} />
                                </View>
                            )}
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                {item.description && (
                                    <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                                )}
                                <Text style={styles.itemCat}>{getCategoryName(item.categoryId)}</Text>
                            </View>
                            <View style={styles.cardRight}>
                                <Text style={styles.price}>₹{item.price.toFixed(0)}</Text>
                            </View>
                        </View>

                        <View style={styles.cardFooter}>
                            <View style={styles.availRow}>
                                <View style={[styles.dot, { backgroundColor: item.is_available ? COLORS.green : COLORS.red }]} />
                                <Text style={styles.availLabel}>
                                    {item.is_available ? 'Available' : 'Unavailable'}
                                </Text>
                                <Switch
                                    value={item.is_available}
                                    onValueChange={() => toggleAvailability(item)}
                                    trackColor={{ false: COLORS.border, true: COLORS.green + '55' }}
                                    thumbColor={item.is_available ? COLORS.green : COLORS.textDim}
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={() => openEditModal(item)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.editBtnText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No items found.</Text>}
            />

            {/* Add / Edit Modal */}
            <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet">
                <KeyboardAvoidingView
                    style={{ flex: 1, backgroundColor: COLORS.bg }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView contentContainerStyle={styles.modal} keyboardShouldPersistTaps="handled">
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingId ? 'Edit Item' : 'Add New Item'}</Text>
                            <TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Name */}
                        <Text style={styles.fieldLabel}>Item Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={form.name}
                            onChangeText={v => setForm(f => ({ ...f, name: v }))}
                            placeholder="e.g. Paneer Tikka"
                            placeholderTextColor={COLORS.textDim}
                            autoCorrect={false}
                        />

                        {/* Description */}
                        <Text style={styles.fieldLabel}>Description</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            value={form.description}
                            onChangeText={v => setForm(f => ({ ...f, description: v }))}
                            placeholder="Short description (optional)"
                            placeholderTextColor={COLORS.textDim}
                            multiline
                        />

                        {/* Price + Category row */}
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>Price (₹) *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={form.price}
                                    onChangeText={v => setForm(f => ({ ...f, price: v }))}
                                    placeholder="0.00"
                                    placeholderTextColor={COLORS.textDim}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>Category *</Text>
                                <ScrollView style={styles.catPicker} horizontal showsHorizontalScrollIndicator={false}>
                                    {categories.map(c => (
                                        <TouchableOpacity
                                            key={c.id}
                                            style={[styles.catOption, form.categoryId === c.id && styles.catOptionActive]}
                                            onPress={() => setForm(f => ({ ...f, categoryId: c.id }))}
                                        >
                                            <Text style={[styles.catOptionText, form.categoryId === c.id && { color: '#000' }]}>
                                                {c.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        {/* Image URL */}
                        <Text style={styles.fieldLabel}>Image URL</Text>
                        <TextInput
                            style={styles.input}
                            value={form.image_url}
                            onChangeText={v => setForm(f => ({ ...f, image_url: v }))}
                            placeholder="https://…"
                            placeholderTextColor={COLORS.textDim}
                            keyboardType="url"
                            autoCapitalize="none"
                        />

                        {/* Available toggle */}
                        <View style={styles.availToggleRow}>
                            <Text style={styles.fieldLabel}>Available</Text>
                            <Switch
                                value={form.is_available}
                                onValueChange={v => setForm(f => ({ ...f, is_available: v }))}
                                trackColor={{ false: COLORS.border, true: COLORS.green + '55' }}
                                thumbColor={form.is_available ? COLORS.green : COLORS.textDim}
                            />
                            <Text style={styles.availToggleHint}>
                                {form.is_available ? 'Visible to customers' : 'Hidden from menu'}
                            </Text>
                        </View>

                        {/* Buttons */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.btnCancel} onPress={closeModal} activeOpacity={0.8}>
                                <Text style={styles.btnCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btnSave, saving && { opacity: 0.6 }]}
                                onPress={handleSave}
                                disabled={saving}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.btnSaveText}>
                                    {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Item'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, paddingTop: 48, backgroundColor: COLORS.surface,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
    sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
    addBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
    addBtnText: { color: '#0f0f13', fontWeight: '700', fontSize: 14 },
    backBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface2 },
    tabsContainer: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    tabsContent: { paddingHorizontal: 10, paddingVertical: 20, flexDirection: 'row', alignItems: 'center' },
    tab: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 99, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, flexShrink: 0, height: 40, justifyContent: 'center' },
    tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    tabText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
    tabTextActive: { color: '#0f0f13' },
    list: { padding: 16, gap: 12, paddingBottom: 32 },
    card: {
        backgroundColor: COLORS.surface, borderRadius: 14,
        borderWidth: 1, borderColor: COLORS.border, padding: 14, gap: 12,
    },
    cardUnavailable: { opacity: 0.6 },
    cardMain: { flexDirection: 'row', alignItems: 'flex-start' },
    thumb: { width: 56, height: 56, borderRadius: 10 },
    thumbPlaceholder: {
        width: 56, height: 56, borderRadius: 10,
        backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center',
    },
    itemName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    itemDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    itemCat: { fontSize: 11, color: COLORS.textDim, marginTop: 4 },
    cardRight: { alignItems: 'flex-end' },
    price: { fontSize: 16, fontWeight: '800', color: COLORS.accent },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
    availRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 99 },
    availLabel: { fontSize: 13, color: COLORS.textMuted },
    editBtn: { backgroundColor: COLORS.surface2, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
    editBtnText: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
    empty: { textAlign: 'center', color: COLORS.textMuted, marginTop: 60, fontSize: 14 },
    // Modal
    modal: { padding: 20, paddingBottom: 48 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingTop: 12 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
    modalClose: { fontSize: 22, color: COLORS.textMuted, padding: 4 },
    fieldLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8, marginTop: 16, letterSpacing: 0.5, textTransform: 'uppercase' },
    input: {
        backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1,
        borderColor: COLORS.border, padding: 14, color: COLORS.text, fontSize: 15,
    },
    catPicker: { maxHeight: 48 },
    catOption: {
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
        backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, marginRight: 8,
    },
    catOptionActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    catOptionText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
    availToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, marginBottom: 8 },
    availToggleHint: { fontSize: 13, color: COLORS.textDim, flex: 1 },
    modalFooter: { flexDirection: 'row', gap: 12, marginTop: 32 },
    btnCancel: {
        flex: 1, backgroundColor: COLORS.surface2, borderRadius: 12, padding: 16,
        alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
    },
    btnCancelText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 15 },
    btnSave: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 12, padding: 16, alignItems: 'center' },
    btnSaveText: { color: '#0f0f13', fontWeight: '800', fontSize: 15 },
});
