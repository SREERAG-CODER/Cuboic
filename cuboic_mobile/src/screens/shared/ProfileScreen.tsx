import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { changePassword } from '../../api/auth';
import { FONT, S } from '../../theme';

export function ProfileScreen() {
    const { user, logout } = useAuth();
    const { toggleTheme, colors, isDark } = useTheme();
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
        <ScrollView style={[S.screen, { backgroundColor: colors.bg }]} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <Text style={[styles.greeting, { color: colors.text }]}>Profile</Text>
                <Text style={[styles.role, { color: colors.textMuted }]}>{user?.role} Account</Text>
            </View>

            <View style={styles.body}>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Appearance</Text>
                    <View style={styles.themeToggleRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Feather name={isDark ? "moon" : "sun"} size={18} color={colors.accent} />
                            <Text style={{ fontSize: 14, color: colors.text }}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
                        </View>
                        <Switch
                            value={!isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.accent }}
                            thumbColor={!isDark ? '#fff' : '#f4f4f5'}
                        />
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Account Details</Text>
                    <Text style={[styles.text, { color: colors.text }]}>Name: {user?.name}</Text>
                    <Text style={[styles.text, { color: colors.text }]}>User ID: {user?.userid || (user as any)?.userId}</Text>
                    <Text style={[styles.text, { color: colors.text }]}>Role: {user?.role}</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Change Password</Text>
                    
                    <Text style={[styles.label, { color: colors.textMuted }]}>Old Password</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text }]}
                        secureTextEntry
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        placeholder="Enter current password"
                        placeholderTextColor={colors.textDim}
                    />

                    <Text style={[styles.label, { color: colors.textMuted }]}>New Password</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text }]}
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new password"
                        placeholderTextColor={colors.textDim}
                    />

                    <Text style={[styles.label, { color: colors.textMuted }]}>Confirm New Password</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text }]}
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                        placeholderTextColor={colors.textDim}
                    />

                    <TouchableOpacity 
                        style={[S.btnPrimary, { marginTop: 12, backgroundColor: colors.accent }]} 
                        onPress={handlePasswordChange}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#000" /> : <Text style={S.btnPrimaryText}>Update Password</Text>}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={[styles.logoutBtn, { backgroundColor: colors.red + '15', borderColor: colors.red + '33' }]} 
                    onPress={logout} 
                    activeOpacity={0.8}
                >
                    <Feather name="log-out" size={20} color={colors.red} />
                    <Text style={[styles.logoutText, { color: colors.red }]}>Sign Out</Text>
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
        borderBottomWidth: 1,
    },
    greeting: { fontSize: 24, fontWeight: '800' },
    role: { fontSize: 13, marginTop: 2 },
    body: { padding: 16 },
    card: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    themeToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    text: { fontSize: 14, marginBottom: 8 },
    label: { fontSize: 12, fontWeight: '600', marginBottom: 4, marginTop: 12 },
    input: {
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        fontSize: 16,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 24,
        gap: 8,
    },
    logoutText: { fontSize: 16, fontWeight: '700' },
});
