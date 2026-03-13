import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme';

export function LoginScreen() {
    const { login } = useAuth();
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
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
                {/* Logo area */}
                <View style={styles.logoArea}>
                    <Feather name="cpu" size={56} color={COLORS.accent} style={{ marginBottom: 12 }} />
                    <Text style={styles.logoTitle}>Cuboic</Text>
                    <Text style={styles.logoSub}>Restaurant Admin</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.label}>User ID</Text>
                    <TextInput
                        style={styles.input}
                        value={userId}
                        onChangeText={setUserId}
                        placeholder="e.g. owner01"
                        placeholderTextColor={COLORS.textDim}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
                    />

                    <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor={COLORS.textDim}
                        secureTextEntry
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                    />

                    <TouchableOpacity
                        style={[styles.btn, loading && styles.btnDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading
                            ? <ActivityIndicator color="#000" />
                            : <Text style={styles.btnText}>Sign In →</Text>
                        }
                    </TouchableOpacity>
                </View>

                <Text style={styles.hint}>
                    Sign in with your Staff or Owner credentials
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.bg },
    inner: { flexGrow: 1, justifyContent: 'center', padding: 28 },
    logoArea: { alignItems: 'center', marginBottom: 48 },
    logoIcon: { fontSize: 56, marginBottom: 12 },
    logoTitle: { fontSize: 32, fontWeight: '800', color: COLORS.text, letterSpacing: 1 },
    logoSub: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
    form: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 20,
    },
    label: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8, letterSpacing: 0.5 },
    input: {
        backgroundColor: COLORS.surface2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 14,
        color: COLORS.text,
        fontSize: 15,
    },
    btn: {
        marginTop: 20,
        backgroundColor: COLORS.accent,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#0f0f13', fontWeight: '800', fontSize: 16 },
    hint: { textAlign: 'center', color: COLORS.textDim, fontSize: 12, marginTop: 32 },
});
