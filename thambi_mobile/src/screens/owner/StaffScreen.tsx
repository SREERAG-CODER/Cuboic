import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usersApi, type User } from '../../api/users';
import { S, FONT } from '../../theme';
import { useNavigation } from '@react-navigation/native';

export function StaffScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const [staff, setStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [name, setName] = useState('');
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'Owner' | 'Manager' | 'Cashier' | 'Waiter' | 'Kitchen' | 'Staff'>('Staff');
    const [dashboardConfig, setDashboardConfig] = useState<string[]>(['Pending', 'Preparing', 'Completed', 'Robots']);

    const ALL_ROLES = ['Owner', 'Manager', 'Cashier', 'Waiter', 'Kitchen', 'Staff'];
    const DASHBOARD_WIDGETS = ['Revenue', 'Orders', 'Pending', 'Preparing', 'Completed', 'Robots'];

    const load = useCallback(async () => {
        if (!user?.restaurantId) return;
        try {
            const data = await usersApi.findAll(user.restaurantId);
            setStaff(data);
        } catch { /* ignore */ }
    }, [user?.restaurantId]);

    useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const openCreate = () => {
        setSelectedUser(null);
        setName('');
        setUserId('');
        setPassword('');
        setRole('Staff');
        setDashboardConfig(['Pending', 'Preparing', 'Completed', 'Robots']);
        setIsEditing(true);
    };

    const openEdit = (u: User) => {
        setSelectedUser(u);
        setName(u.name);
        setUserId(u.user_id);
        setPassword('');
        setRole(u.role as any);
        setDashboardConfig(u.dashboard_config || ['Pending', 'Preparing', 'Completed', 'Robots']);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!name || !userId) {
            Alert.alert('Error', 'Name and User ID are required');
            return;
        }

        try {
            if (selectedUser) {
                await usersApi.update(selectedUser.id, {
                    name,
                    role,
                    dashboard_config: dashboardConfig,
                    ...(password ? { password } : {})
                });
                Alert.alert('Success', 'Staff updated');
            } else {
                if (!password) {
                    Alert.alert('Error', 'Password is required for new staff');
                    return;
                }
                await usersApi.create({
                    name,
                    userId,
                    password,
                    role,
                    dashboard_config: dashboardConfig,
                    restaurantId: user?.restaurantId
                });
                Alert.alert('Success', 'Staff created');
            }
            setIsEditing(false);
            load();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to save staff');
        }
    };

    const handleDeactivate = async () => {
        if (!selectedUser) return;
        Alert.alert('Deactivate', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Deactivate', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        await usersApi.remove(selectedUser.id);
                        Alert.alert('Success', 'Staff deactivated');
                        setIsEditing(false);
                        load();
                    } catch {
                        Alert.alert('Error', 'Failed to deactivate staff');
                    }
                }
            }
        ]);
    };

    if (loading) return (
        <View style={[S.screen, { backgroundColor: colors.bg }]}>
            <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: 80 }} />
        </View>
    );

    if (isEditing) {
        return (
            <ScrollView style={[S.screen, { backgroundColor: colors.bg }]} contentContainerStyle={{ padding: 16, paddingBottom: 40, paddingTop: 48 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                    <TouchableOpacity onPress={() => setIsEditing(false)} style={{ marginRight: 12 }}>
                        <Feather name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
                        {selectedUser ? 'Edit Staff' : 'Add Staff'}
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Name</Text>
                    <TextInput style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text }]} value={name} onChangeText={setName} placeholder="John Doe" placeholderTextColor={colors.textDim} />

                    <Text style={[styles.label, { color: colors.textMuted }]}>User ID (Login)</Text>
                    <TextInput style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text }]} value={userId} onChangeText={setUserId} editable={!selectedUser} placeholder="john123" placeholderTextColor={colors.textDim} autoCapitalize="none" />

                    <Text style={[styles.label, { color: colors.textMuted }]}>{selectedUser ? 'New Password (leave blank to keep)' : 'Password'}</Text>
                    <TextInput style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text }]} value={password} onChangeText={setPassword} secureTextEntry placeholder="***" placeholderTextColor={colors.textDim} />

                    <Text style={[styles.label, { color: colors.textMuted }]}>Role</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12, marginTop: 4 }}>
                        {ALL_ROLES.map(r => (
                            <TouchableOpacity 
                                key={r} 
                                style={[styles.roleBtn, { backgroundColor: colors.surface2, borderColor: colors.border }, role === r && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                                onPress={() => setRole(r as any)}
                            >
                                <Text style={[styles.roleBtnText, { color: colors.textMuted }, role === r && { color: '#000' }]}>{r}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { color: colors.textMuted }]}>Dashboard Visibility Widgets</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, marginTop: 4 }}>
                        {DASHBOARD_WIDGETS.map(w => {
                            const selected = dashboardConfig.includes(w);
                            return (
                                <TouchableOpacity 
                                    key={w} 
                                    style={[styles.roleBtn, { backgroundColor: colors.surface2, borderColor: colors.border }, selected && { backgroundColor: colors.green + '15', borderColor: colors.green + '55' }]}
                                    onPress={() => {
                                        if (selected) setDashboardConfig(p => p.filter(x => x !== w));
                                        else setDashboardConfig(p => [...p, w]);
                                    }}
                                >
                                    <Feather name={selected ? "check-square" : "square"} size={14} color={selected ? colors.green : colors.textMuted} style={{ marginRight: 6 }} />
                                    <Text style={[styles.roleBtnText, { color: colors.textMuted }, selected && { color: colors.text }]}>{w}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    <TouchableOpacity style={[S.btnPrimary, { marginTop: 16, backgroundColor: colors.accent }]} onPress={handleSave}>
                        <Text style={[S.btnPrimaryText, { color: '#000' }]}>{selectedUser ? 'Save Changes' : 'Create Staff'}</Text>
                    </TouchableOpacity>

                    {selectedUser && (
                        <TouchableOpacity style={[styles.deactivateBtn, { backgroundColor: colors.red + '15', borderColor: colors.red + '33' }]} onPress={handleDeactivate}>
                            <Text style={[styles.deactivateText, { color: colors.red }]}>Deactivate User</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        );
    }

    return (
        <View style={[S.screen, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surface2 }]}>
                        <Feather name="arrow-left" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.title, { color: colors.text }]}>Staff</Text>
                        <Text style={[styles.sub, { color: colors.textMuted }]}>Manage restaurant team</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={openCreate} style={[styles.addBtn, { backgroundColor: colors.accent }]}>
                    <Feather name="plus" size={20} color="#000" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={staff}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => openEdit(item)} activeOpacity={0.7}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={[styles.staffName, { color: colors.text }]}>{item.name} {!item.is_active && '(Inactive)'}</Text>
                                <Text style={[styles.staffSub, { color: colors.textMuted }]}>{item.user_id} • {item.role}</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color={colors.textMuted} />
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={[styles.empty, { color: colors.textMuted }]}>No staff members found.</Text>}
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
    card: {
        ...S.shadow, borderRadius: 12, padding: 16, borderWidth: 1 },
    staffName: { fontSize: 16, fontWeight: '700' },
    staffSub: { fontSize: 13, marginTop: 4 },
    empty: { textAlign: 'center', marginTop: 40 },
    
    label: { fontSize: 12, fontWeight: '600', marginBottom: 4, marginTop: 8 },
    input: {
        ...S.shadow,
        borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12,
        borderWidth: 1, fontSize: 16,
    },
    roleBtn: {
        ...S.shadow,
        paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center', borderRadius: 8,
        borderWidth: 1, flexDirection: 'row', justifyContent: 'center'
    },
    roleBtnText: { fontWeight: '600' },
    deactivateBtn: {
        ...S.shadow, marginTop: 16, padding: 14, alignItems: 'center', borderRadius: 8, borderWidth: 1 },
    deactivateText: { fontWeight: '700' }
});
