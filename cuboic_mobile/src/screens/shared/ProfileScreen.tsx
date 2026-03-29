import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../api/auth';
import { COLORS, S } from '../../theme';

export function ProfileScreen() {
    const { user, logout } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await changePassword({ oldPassword, newPassword });
            Alert.alert('Success', 'Password changed successfully');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={S.screen} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Profile</Text>
                <Text style={styles.role}>{user?.role} Account</Text>
            </View>

            <View style={styles.body}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Account Details</Text>
                    <Text style={styles.text}>Name: {user?.name}</Text>
                    <Text style={styles.text}>User ID: {user?.userid || (user as any)?.userId}</Text>
                    <Text style={styles.text}>Role: {user?.role}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Change Password</Text>
                    
                    <Text style={styles.label}>Old Password</Text>
                    <TextInput
                        style={styles.input}
                        secureTextEntry
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        placeholder="Enter current password"
                        placeholderTextColor={COLORS.textDim}
                    />

                    <Text style={styles.label}>New Password</Text>
                    <TextInput
                        style={styles.input}
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new password"
                        placeholderTextColor={COLORS.textDim}
                    />

                    <Text style={styles.label}>Confirm New Password</Text>
                    <TextInput
                        style={styles.input}
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                        placeholderTextColor={COLORS.textDim}
                    />

                    <TouchableOpacity 
                        style={[S.btnPrimary, { marginTop: 12 }]} 
                        onPress={handlePasswordChange}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#000" /> : <Text style={S.btnPrimaryText}>Update Password</Text>}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
                    <Feather name="log-out" size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 48,
        paddingHorizontal: 16,
        paddingBottom: 24,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    greeting: { fontSize: 24, fontWeight: '800', color: COLORS.text },
    role: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
    body: { padding: 16 },
    card: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
    text: { fontSize: 14, color: COLORS.text, marginBottom: 8 },
    label: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 4, marginTop: 8 },
    input: {
        backgroundColor: COLORS.surface2,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
        fontSize: 16,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#ef444415',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ef444433',
        marginTop: 24,
        gap: 8,
    },
    logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '700' },
});
