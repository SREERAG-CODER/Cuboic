import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, ActivityIndicator, ScrollView, Switch, Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { changePassword, updateProfile } from '../../api/auth';
import { S } from '../../theme';

export function ProfileScreen() {
    const { user, logout, updateUser } = useAuth();
    const { toggleTheme, colors, isDark } = useTheme();

    // Contact info – initialise from user object (backend)
    const [email, setEmail] = useState(user?.email ?? '');
    const [phone, setPhone] = useState(user?.phone ?? '');
    const [editingContact, setEditingContact] = useState(false);
    const [savingContact, setSavingContact] = useState(false);

    // Password change
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPwd, setLoadingPwd] = useState(false);
    const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);

    // Keep local state in sync if user object changes
    useEffect(() => {
        setEmail(user?.email ?? '');
        setPhone(user?.phone ?? '');
    }, [user?.email, user?.phone]);

    const saveContactInfo = async () => {
        setSavingContact(true);
        try {
            const updated = await updateProfile({ email: email.trim() || undefined, phone: phone.trim() || undefined });
            await updateUser({ email: updated.email, phone: updated.phone });
            setEditingContact(false);
            Alert.alert('Saved', 'Contact info updated successfully.');
        } catch {
            Alert.alert('Error', 'Failed to save contact info.');
        } finally {
            setSavingContact(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }
        setLoadingPwd(true);
        try {
            await changePassword({ oldPassword, newPassword });
            Alert.alert('Success', 'Password changed successfully');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to change password');
        } finally {
            setLoadingPwd(false);
        }
    };

    const openEmail = () => Linking.openURL('mailto:support@.thambi.com');
    const openPhone = () => Linking.openURL('tel:+918000000000');

    /* ─── Components ─────────────────────────────────────────────── */

    const SectionLabel = ({ title }: { title: string }) => (
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
    );

    const Divider = () => (
        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
    );

    const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
        <View style={styles.infoRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.bg }]}>
                <Feather name={icon} size={18} color={colors.textMuted} />
            </View>
            <View style={styles.infoRowText}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                    {value || <Text style={{ color: colors.textDim }}>Not set</Text>}
                </Text>
            </View>
        </View>
    );

    return (
        <ScrollView
            style={[S.screen, { backgroundColor: colors.bg }]}
            contentContainerStyle={{ paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
        >
            {/* ── Header ─────────────────────────────────────────── */}
            <View style={styles.header}>
                <View style={[styles.avatar, { backgroundColor: colors.accent + '22' }]}>
                    <Text style={[styles.avatarText, { color: colors.accent }]}>
                        {(user?.name ?? 'U')[0].toUpperCase()}
                    </Text>
                </View>
                <Text style={[styles.userName, { color: colors.text }]}>{user?.name ?? '—'}</Text>
                <View style={[styles.roleBadge, { backgroundColor: colors.accent + '22' }]}>
                    <Text style={[styles.roleText, { color: colors.accent }]}>{user?.role}</Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: isDark ? '#1a1a1a' : '#efefef' }]} />

            {/* ── Account Details ────────────────────────────────── */}
            <View style={styles.section}>
                <SectionLabel title="ACCOUNT" />
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <InfoRow icon="user" label="Full Name" value={user?.name ?? ''} />
                    <Divider />
                    <InfoRow icon="hash" label="User ID" value={user?.userid ?? (user as any)?.userId ?? ''} />
                    <Divider />
                    <InfoRow icon="briefcase" label="Role" value={user?.role ?? ''} />
                    <Divider />

                    {/* Editable Contact Fields */}
                    {editingContact ? (
                        <View style={styles.editBlock}>
                            <View style={styles.editFieldRow}>
                                <Feather name="mail" size={18} color={colors.textMuted} style={{ marginRight: 12 }} />
                                <TextInput
                                    style={[styles.editInput, { color: colors.text, borderBottomColor: colors.border }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Email address"
                                    placeholderTextColor={colors.textDim}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            <View style={[styles.editFieldRow, { marginTop: 14 }]}>
                                <Feather name="phone" size={18} color={colors.textMuted} style={{ marginRight: 12 }} />
                                <TextInput
                                    style={[styles.editInput, { color: colors.text, borderBottomColor: colors.border }]}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Phone number"
                                    placeholderTextColor={colors.textDim}
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <View style={styles.editActions}>
                                <TouchableOpacity
                                    style={[styles.editActionBtn, { borderColor: colors.border }]}
                                    onPress={() => setEditingContact(false)}
                                >
                                    <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.editActionBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]}
                                    onPress={saveContactInfo}
                                    disabled={savingContact}
                                >
                                    {savingContact
                                        ? <ActivityIndicator color="#000" size="small" />
                                        : <Text style={{ color: '#000', fontWeight: '700' }}>Save</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <>
                            <InfoRow icon="mail" label="Email" value={email} />
                            <Divider />
                            <InfoRow icon="phone" label="Phone Number" value={phone} />
                            <TouchableOpacity
                                style={[styles.editContactBtn, { borderTopColor: colors.border }]}
                                onPress={() => setEditingContact(true)}
                                activeOpacity={0.7}
                            >
                                <Feather name="edit-2" size={14} color={colors.accent} />
                                <Text style={[styles.editContactText, { color: colors.accent }]}>Edit Contact Info</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            {/* ── Preferences ────────────────────────────────────── */}
            <View style={styles.section}>
                <SectionLabel title="PREFERENCES" />
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.listItem}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.bg }]}>
                            <Feather name={isDark ? 'moon' : 'sun'} size={18} color={colors.textMuted} />
                        </View>
                        <View style={styles.listItemText}>
                            <Text style={[styles.listItemTitle, { color: colors.text }]}>Theme</Text>
                            <Text style={[styles.listItemSub, { color: colors.textMuted }]}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
                        </View>
                        <Switch
                            value={!isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.accent }}
                            thumbColor={!isDark ? '#fff' : '#f4f4f5'}
                        />
                    </View>
                </View>
            </View>

            {/* ── Security ───────────────────────────────────────── */}
            <View style={styles.section}>
                <SectionLabel title="SECURITY" />
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.listItem, { marginBottom: isPasswordExpanded ? 4 : 0 }]}
                        activeOpacity={0.7}
                        onPress={() => setIsPasswordExpanded(!isPasswordExpanded)}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: colors.bg }]}>
                            <Feather name="lock" size={18} color={colors.textMuted} />
                        </View>
                        <Text style={[styles.listItemTitle, { color: colors.text, flex: 1 }]}>Change Password</Text>
                        <Feather name={isPasswordExpanded ? "chevron-up" : "chevron-down"} size={18} color={colors.textMuted} />
                    </TouchableOpacity>

                    {isPasswordExpanded && (
                        <View style={[styles.pwdBlock, { borderTopColor: colors.border }]}>
                            <TextInput
                                style={[styles.pwdInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                                secureTextEntry
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                placeholder="Current Password"
                                placeholderTextColor={colors.textDim}
                            />
                            <TextInput
                                style={[styles.pwdInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="New Password"
                                placeholderTextColor={colors.textDim}
                            />
                            <TextInput
                                style={[styles.pwdInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm New Password"
                                placeholderTextColor={colors.textDim}
                            />
                            <TouchableOpacity
                                style={[styles.pwdBtn, { backgroundColor: colors.accent }]}
                                onPress={handlePasswordChange}
                                disabled={loadingPwd}
                            >
                                {loadingPwd
                                    ? <ActivityIndicator color="#000" />
                                    : <Text style={styles.pwdBtnText}>Update Password</Text>}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {/* ── Help & Support ─────────────────────────────────── */}
            <View style={styles.section}>
                <SectionLabel title="HELP & SUPPORT" />
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={openEmail}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.bg }]}>
                            <Feather name="mail" size={18} color={colors.textMuted} />
                        </View>
                        <View style={styles.listItemText}>
                            <Text style={[styles.listItemTitle, { color: colors.text }]}>Email Support</Text>
                            <Text style={[styles.listItemSub, { color: colors.textMuted }]}>support@thambi.com</Text>
                        </View>
                        <Feather name="chevron-right" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                    <Divider />
                    <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={openPhone}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.bg }]}>
                            <Feather name="phone-call" size={18} color={colors.textMuted} />
                        </View>
                        <View style={styles.listItemText}>
                            <Text style={[styles.listItemTitle, { color: colors.text }]}>Call Support</Text>
                            <Text style={[styles.listItemSub, { color: colors.textMuted }]}>+91 80000 00000</Text>
                        </View>
                        <Feather name="chevron-right" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                    <Divider />
                    <TouchableOpacity
                        style={styles.listItem}
                        activeOpacity={0.7}
                        onPress={() => Alert.alert('FAQs', 'FAQ section coming soon.')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: colors.bg }]}>
                            <Feather name="help-circle" size={18} color={colors.textMuted} />
                        </View>
                        <View style={styles.listItemText}>
                            <Text style={[styles.listItemTitle, { color: colors.text }]}>FAQs</Text>
                            <Text style={[styles.listItemSub, { color: colors.textMuted }]}>Browse common questions</Text>
                        </View>
                        <Feather name="chevron-right" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Sign Out ───────────────────────────────────────── */}
            <View style={[styles.section, { marginTop: 8 }]}>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={logout}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.red + '18' }]}>
                            <Feather name="log-out" size={18} color={colors.red} />
                        </View>
                        <Text style={[styles.listItemTitle, { color: colors.red }]}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    /* Header */
    header: {
        alignItems: 'center',
        paddingTop: 52,
        paddingBottom: 28,
        paddingHorizontal: 20,
    },
    avatar: {
        width: 76,
        height: 76,
        borderRadius: 38,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    avatarText: { fontSize: 30, fontWeight: '800' },
    userName: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
    roleBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
    roleText: { fontSize: 13, fontWeight: '700' },

    /* Divider between header and sections */
    divider: { height: 10, width: '100%' },

    /* Sections */
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },

    /* Info rows */
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    infoRowText: { flex: 1 },
    infoLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2, letterSpacing: 0.3 },
    infoValue: { fontSize: 15, fontWeight: '500' },
    rowDivider: { height: 1, marginLeft: 64 },

    /* Edit contact inline */
    editBlock: { padding: 16 },
    editFieldRow: { flexDirection: 'row', alignItems: 'center' },
    editInput: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 6,
        borderBottomWidth: 1,
    },
    editActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
    editActionBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editContactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    editContactText: { fontSize: 13, fontWeight: '600' },

    /* Generic list item */
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 4,
    },
    listItemText: { flex: 1 },
    listItemTitle: { fontSize: 15, fontWeight: '600', marginLeft: 4 },
    listItemSub: { fontSize: 12, marginTop: 2, marginLeft: 4 },

    /* Icon circle */
    iconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },

    /* Password block */
    pwdBlock: { borderTopWidth: 1, padding: 16, gap: 10 },
    pwdInput: {
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
    },
    pwdBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 4,
    },
    pwdBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
