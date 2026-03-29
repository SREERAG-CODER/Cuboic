import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { tablesApi, type RestaurantTable } from '../../api/tables';
import { COLORS, S } from '../../theme';
import { useNavigation } from '@react-navigation/native';

export function TablesScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [isCreating, setIsCreating] = useState(false);
    const [tableNum, setTableNum] = useState('');

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

    if (loading) return <View style={S.screen}><ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 80 }} /></View>;

    return (
        <View style={S.screen}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={20} color={COLORS.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>Tables</Text>
                        <Text style={styles.sub}>Manage restaurant tables</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => setIsCreating(!isCreating)} style={styles.addBtn}>
                    <Feather name={isCreating ? "x" : "plus"} size={20} color="#000" />
                </TouchableOpacity>
            </View>

            {isCreating && (
                <View style={styles.createArea}>
                    <Text style={styles.label}>New Table Number / Name</Text>
                    <TextInput 
                        style={styles.input} 
                        value={tableNum} 
                        onChangeText={setTableNum} 
                        placeholder="e.g. 12 or Patio A" 
                        placeholderTextColor={COLORS.textDim} 
                    />
                    <TouchableOpacity style={[S.btnPrimary, { marginTop: 12 }]} onPress={handleCreate}>
                        <Text style={S.btnPrimaryText}>Add Table</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={tables}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                renderItem={({ item }) => (
                    <View style={[styles.card, !item.is_active && { opacity: 0.6 }]}>
                        <View>
                            <Text style={styles.tableName}>Table {item.table_number}</Text>
                            <Text style={[styles.statusText, { color: item.is_active ? COLORS.green : COLORS.red }]}>
                                {item.is_active ? 'Active' : 'Maintenance'}
                            </Text>
                        </View>
                        <Switch
                            value={item.is_active}
                            onValueChange={(val) => handleToggle(item, val)}
                            trackColor={{ false: COLORS.border, true: COLORS.accent }}
                            thumbColor={item.is_active ? "#fff" : "#f4f3f4"}
                        />
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No tables found.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16,
        backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border
    },
    title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
    sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
    addBtn: { backgroundColor: COLORS.accent, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    backBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface2 },
    createArea: { padding: 16, backgroundColor: COLORS.surface2, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    label: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8 },
    input: { backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, fontSize: 16 },
    card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tableName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    statusText: { fontSize: 13, marginTop: 4, fontWeight: '600' },
    empty: { textAlign: 'center', color: COLORS.textMuted, marginTop: 40 },
});
