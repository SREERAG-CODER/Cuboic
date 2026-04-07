import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, Switch, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { tablesApi, type RestaurantTable } from '../../api/tables';
import { S, FONT } from '../../theme';
import { useNavigation } from '@react-navigation/native';

export function TablesScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [isCreating, setIsCreating] = useState(false);
    const [tableNum, setTableNum] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'maintenance'>('all');

    const load = useCallback(async () => {
        if (!user?.restaurantId) return;
        try {
            const data = await tablesApi.findAll(user.restaurantId);
            setTables(data);
        } catch { /* ignore */ }
    }, [user?.restaurantId]);

    useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const handleCreate = async () => {
        if (!tableNum.trim() || !user?.restaurantId) return;
        try {
            await tablesApi.create({ restaurantId: user.restaurantId, table_number: tableNum });
            Alert.alert('Success', 'Table added');
            setTableNum('');
            setIsCreating(false);
            load();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to add table');
        }
    };

    const handleToggle = async (table: RestaurantTable, value: boolean) => {
        try {
            // Optimistic update
            setTables(prev => prev.map(t => t.id === table.id ? { ...t, is_active: value } : t));
            await tablesApi.updateStatus(table.id, value);
        } catch {
            // Revert
            Alert.alert('Error', 'Failed to update table status');
            load();
        }
    };

    if (loading) return (
        <View style={[S.screen, { backgroundColor: colors.bg }]}>
            <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: 80 }} />
        </View>
    );

    return (
        <View style={[S.screen, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surface2 }]}>
                        <Feather name="arrow-left" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.title, { color: colors.text }]}>Tables</Text>
                        <Text style={[styles.sub, { color: colors.textMuted }]}>Manage restaurant tables</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => setIsCreating(!isCreating)} style={[styles.addBtn, { backgroundColor: colors.accent }]}>
                    <Feather name={isCreating ? "x" : "plus"} size={20} color="#000" />
                </TouchableOpacity>
            </View>

            {isCreating && (
                <View style={[styles.createArea, { backgroundColor: colors.surface2, borderBottomColor: colors.border }]}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>New Table Number / Name</Text>
                    <TextInput 
                        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} 
                        value={tableNum} 
                        onChangeText={setTableNum} 
                        placeholder="e.g. 12 or Patio A" 
                        placeholderTextColor={colors.textDim} 
                    />
                    <TouchableOpacity style={[S.btnPrimary, { marginTop: 12, backgroundColor: colors.accent }]} onPress={handleCreate}>
                        <Text style={[S.btnPrimaryText, { color: '#000' }]}>Add Table</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.chipScrollContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                    {(['all', 'active', 'maintenance'] as const).map(f => {
                        const isActive = filter === f;
                        return (
                            <TouchableOpacity
                                key={f}
                                style={[styles.chip, { backgroundColor: isActive ? colors.accent : colors.surface, borderColor: colors.border }]}
                                onPress={() => setFilter(f)}
                            >
                                <Text style={[styles.chipText, { color: isActive ? '#000' : colors.text }]}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <FlatList
                data={tables.filter(t => filter === 'all' ? true : filter === 'active' ? t.is_active : !t.is_active)}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, !item.is_active && { opacity: 0.6 }]}>
                        <View>
                            <Text style={[styles.tableName, { color: colors.text }]}>Table {item.table_number}</Text>
                            <Text style={[styles.statusText, { color: item.is_active ? colors.green : colors.red }]}>
                                {item.is_active ? 'Active' : 'Maintenance'}
                            </Text>
                        </View>
                        <Switch
                            value={item.is_active}
                            onValueChange={(val) => handleToggle(item, val)}
                            trackColor={{ false: colors.border, true: colors.accent }}
                            thumbColor={item.is_active ? "#fff" : "#f4f3f4"}
                        />
                    </View>
                )}
                ListEmptyComponent={<Text style={[styles.empty, { color: colors.textMuted }]}>No tables found.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        ...S.shadow,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16,
        borderBottomWidth: 1,
    },
    title: { fontSize: 24, fontWeight: '800' },
    sub: { fontSize: 13, marginTop: 2 },
    addBtn: {
        ...S.shadow, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    backBtn: {
        ...S.shadow, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    createArea: { padding: 16, borderBottomWidth: 1 },
    label: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
    input: {
        ...S.shadow, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, fontSize: 16 },
    chipScrollContainer: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    chipRow: { gap: 8, paddingHorizontal: 16 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    chipText: { fontSize: 13, fontWeight: '600' },
    card: {
        ...S.shadow, borderRadius: 12, padding: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tableName: {
        ...S.shadow, fontSize: 16, fontWeight: '700' },
    statusText: { fontSize: 13, marginTop: 4, fontWeight: '600' },
    empty: { textAlign: 'center', marginTop: 40 },
});
