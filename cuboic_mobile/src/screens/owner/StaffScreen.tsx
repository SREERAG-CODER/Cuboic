import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { usersApi, type User } from '../../api/users';
import { COLORS, S } from '../../theme';
import { useNavigation } from '@react-navigation/native';

export function StaffScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [staff, setStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [name, setName] = useState('');
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'Owner' | 'Staff'>('Staff');

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
        setIsEditing(true);
    };

    const openEdit = (u: User) => {
        setSelectedUser(u);
        setName(u.name);
        setUserId(u.user_id);
        setPassword('');
        setRole(u.role as 'Owner' | 'Staff');
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
        <View style={S.screen}><ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 80 }} /></View>
    );

    if (isEditing) {
        return (
            <ScrollView style={S.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40, paddingTop: 48 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                    <TouchableOpacity onPress={() => setIsEditing(false)} style={{ marginRight: 12 }}>
                        <Feather name="arrow-left" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: COLORS.text }}>
                        {selectedUser ? 'Edit Staff' : 'Add Staff'}
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="John Doe" placeholderTextColor={COLORS.textDim} />

                    <Text style={styles.label}>User ID (Login)</Text>
                    <TextInput style={styles.input} value={userId} onChangeText={setUserId} editable={!selectedUser} placeholder="john123" placeholderTextColor={COLORS.textDim} autoCapitalize="none" />

                    <Text style={styles.label}>{selectedUser ? 'New Password (leave blank to keep)' : 'Password'}</Text>
                    <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="***" placeholderTextColor={COLORS.textDim} />

                    <Text style={styles.label}>Role</Text>
                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12, marginTop: 4 }}>
                        {['Staff', 'Owner'].map(r => (
                            <TouchableOpacity 
                                key={r} 
                                style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                                onPress={() => setRole(r as any)}
                            >
                                <Text style={[styles.roleBtnText, role === r && { color: '#000' }]}>{r}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={[S.btnPrimary, { marginTop: 16 }]} onPress={handleSave}>
                        <Text style={S.btnPrimaryText}>{selectedUser ? 'Save Changes' : 'Create Staff'}</Text>
                    </TouchableOpacity>

                    {selectedUser && (
                        <TouchableOpacity style={styles.deactivateBtn} onPress={handleDeactivate}>
                            <Text style={styles.deactivateText}>Deactivate User</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        );
    }

    return (
        <View style={S.screen}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={20} color={COLORS.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>Staff</Text>
                        <Text style={styles.sub}>Manage restaurant team</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={openCreate} style={styles.addBtn}>
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
                    <TouchableOpacity style={styles.card} onPress={() => openEdit(item)} activeOpacity={0.7}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={styles.staffName}>{item.name} {!item.is_active && '(Inactive)'}</Text>
                                <Text style={styles.staffSub}>{item.user_id} • {item.role}</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No staff members found.</Text>}
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
    card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border },
    staffName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    staffSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
    empty: { textAlign: 'center', color: COLORS.textMuted, marginTop: 40 },
    
    label: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 4, marginTop: 8 },
    input: {
        backgroundColor: COLORS.surface2, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12,
        color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, fontSize: 16,
    },
    roleBtn: {
        flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8,
        borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface2
    },
    roleBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    roleBtnText: { color: COLORS.textMuted, fontWeight: '600' },
    deactivateBtn: { marginTop: 16, padding: 14, alignItems: 'center', borderRadius: 8, backgroundColor: '#ef444415', borderWidth: 1, borderColor: '#ef444433' },
    deactivateText: { color: '#ef4444', fontWeight: '700' }
});
