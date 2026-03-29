import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
    ScrollView, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
        <LinearGradient
            colors={['#ffffffff', '#ffffffff', '#121212', '#121212ff']}
            locations={[0, 0.5, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.screen}
        >
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
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    inner: { flexGrow: 1, justifyContent: 'flex-start', padding: 28, paddingTop: 60, width: '100%', maxWidth: 480, alignSelf: 'center' },
    logoArea: { alignItems: 'center', marginBottom: 38 },
    logoImage: { width: 200, height: 200, marginBottom: -30, borderRadius: 30 },
    logoTitle: { fontSize: 36, fontWeight: '800', color: '#e76837ff', letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
    logoSub: { fontSize: 14, color: '#8b8aa0', marginTop: 4, fontWeight: '600' },
    form: {
        backgroundColor: '#b2b2b7ff',
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#050505ff',
        padding: 24,
        // Card elevation/shadow for split background
        shadowColor: '#3fb938ff',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 10,
        shadowRadius: 20,
        elevation: 10,
    },
    label: { fontSize: 12, fontWeight: '600', color: '#000000ff', marginBottom: 8, letterSpacing: 0.5 },
    input: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#000000ff',
        padding: 14,
        color: '#1c1c1e',
        fontSize: 15,
    },
    btn: {
        marginTop: 20,
        backgroundColor: '#7CC018',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#0f0f13', fontWeight: '800', fontSize: 16 },
    hint: { textAlign: 'center', color: COLORS.textDim, fontSize: 12, marginTop: 32 },
});
