import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
    ScrollView, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { S, FONT } from '../../theme';

export function LoginScreen() {
    const { login } = useAuth();
    const { colors, isDark } = useTheme();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (!userId.trim() || !password) return;
        setLoading(true);
        try {
            await login(userId.trim(), password);
        } catch (e: any) {
            Alert.alert('Login Failed', e?.response?.data?.message ?? 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={[S.screen, { backgroundColor: colors.bg }]}>
            <LinearGradient
                colors={isDark ? [colors.bg, colors.surface] : ['#f8fafc', '#f1f5f9']}
                style={StyleSheet.absoluteFill}
            />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
                    {/* Logo area */}
                    <View style={styles.logoArea}>
                        <Image
                            source={require('../../../assets/bg.png')}
                            style={styles.logoImage}
                        />
                        <Text style={[styles.logoSub, { color: colors.textMuted }]}>Restaurant Admin</Text>
                    </View>

                    {/* Form */}
                    <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.label, { color: colors.text }]}>User ID</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text }]}
                            value={userId}
                            onChangeText={setUserId}
                            placeholder="e.g. owner01"
                            placeholderTextColor={colors.textDim}
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="next"
                        />

                        <Text style={[styles.label, { marginTop: 16, color: colors.text }]}>Password</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text }]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            placeholderTextColor={colors.textDim}
                            secureTextEntry
                            returnKeyType="done"
                            onSubmitEditing={handleLogin}
                        />

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: colors.accent }, loading && styles.btnDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading
                                ? <ActivityIndicator color="#000" />
                                : <Text style={[styles.btnText, { color: '#000' }]}>Sign In →</Text>
                            }
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.hint, { color: colors.textDim }]}>
                        Sign in with your Staff or Owner credentials
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    inner: { flexGrow: 1, justifyContent: 'center', padding: 28, paddingTop: 60, width: '100%', maxWidth: 480, alignSelf: 'center' },
    logoArea: { alignItems: 'center', marginBottom: 38 },
    logoImage: { width: 180, height: 180, borderRadius: 30 },
    logoSub: { fontSize: 14, marginTop: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
    form: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    label: { fontSize: 13, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
    input: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        fontSize: 16,
    },
    btn: {
        marginTop: 24,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#65a30d',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { fontWeight: '800', fontSize: 16 },
    hint: { textAlign: 'center', fontSize: 12, marginTop: 32, fontStyle: 'italic' },
});
