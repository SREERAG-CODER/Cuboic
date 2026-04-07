import React, { useState, useRef, useEffect } from 'react';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { Orbitron_400Regular, Orbitron_700Bold } from '@expo-google-fonts/orbitron';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
    ScrollView, Image, Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { S } from '../../theme';

export function LoginScreen() {
    const { login } = useAuth();
    const { colors, isDark } = useTheme();
    const [fontsLoaded] = useFonts({ Pacifico_400Regular, Orbitron_400Regular, Orbitron_700Bold });
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Spring entrance animation
    const cardAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.spring(cardAnim, {
            toValue: 1,
            tension: 55,
            friction: 9,
            useNativeDriver: true,
        }).start();
    }, []);

    const cardAnimStyle = {
        opacity: cardAnim,
        transform: [{
            translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }),
        }],
    };

    async function handleLogin() {
        if (!userId.trim() || !password) return;
        setLoading(true);
        try {
            await login(userId.trim(), password);
        } catch (e: any) {
            console.log('[LOGIN ERROR] code:', e?.code);
            console.log('[LOGIN ERROR] message:', e?.message);
            console.log('[LOGIN ERROR] response status:', e?.response?.status);
            console.log('[LOGIN ERROR] response data:', JSON.stringify(e?.response?.data));

            const isTimeout = e?.code === 'ECONNABORTED' || e?.message?.includes('timeout');
            const isNetworkError = !e?.response;
            const serverMsg = e?.response?.data?.message;

            if (isTimeout || isNetworkError) {
                Alert.alert('Connection Error', 'Could not reach the server. It may be starting up — please wait a moment and try again.');
            } else {
                Alert.alert('Login Failed', serverMsg ?? 'Invalid credentials. Please check your User ID and password.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={[S.screen, { backgroundColor: colors.bg }]}>
            {/* Subtle green-tinted background gradient */}
            <LinearGradient
                colors={isDark
                    ? ['#0d0d0d', '#0c150c'] as const
                    : ['#f1f5f9', '#eaf2ea'] as const
                }
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative radial glow (top accent circle) */}
            <View style={[styles.glowOrb, { backgroundColor: colors.accent + (isDark ? '18' : '12') }]} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.inner}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View style={cardAnimStyle}>
                        {/* ─── Unified Floating Card ─── */}
                        <View style={[styles.card, {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            shadowColor: colors.accent,
                        }]}>
                            {/* Lime-green accent top bar */}
                            <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />

                            {/* Logo section inside card */}
                            <View style={styles.logoArea}>
                                <View style={[styles.logoRing, { borderColor: colors.accent + '50', backgroundColor: colors.surface2 }]}>
                                    <Image
                                        source={require('../../../assets/pic1.png')}
                                        style={styles.logoImage}
                                    />
                                </View>
                                <Text style={[styles.appName, { color: colors.accent, fontFamily: fontsLoaded ? 'Orbitron_400Regular' : undefined }]}>THAMBI</Text>
                                <View style={[styles.badgePill, { backgroundColor: colors.accent + '20', borderColor: colors.accent + '40' }]}>
                                    <Feather name="shield" size={11} color={colors.accent} style={{ marginRight: 5 }} />
                                    <Text style={[styles.badgeText, { color: colors.accent }]}>Restaurant Admin</Text>
                                </View>
                            </View>

                            {/* Divider */}
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />

                            {/* Form body */}
                            <View style={styles.formBody}>
                                <Text style={[styles.label, { color: colors.textMuted }]}>User ID</Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: colors.surface2,
                                        borderColor: colors.border,
                                        color: colors.text,
                                    }]}
                                    value={userId}
                                    onChangeText={setUserId}
                                    placeholder="e.g. owner01"
                                    placeholderTextColor={colors.textDim}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                />

                                <Text style={[styles.label, { marginTop: 16, color: colors.textMuted }]}>Password</Text>
                                <View style={[styles.passwordRow, {
                                    backgroundColor: colors.surface2,
                                    borderColor: colors.border,
                                }]}>
                                    <TextInput
                                        style={[styles.passwordInput, { color: colors.text }]}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="••••••••"
                                        placeholderTextColor={colors.textDim}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        onSubmitEditing={handleLogin}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(v => !v)}
                                        style={styles.eyeBtn}
                                        activeOpacity={0.7}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Feather
                                            name={showPassword ? 'eye-off' : 'eye'}
                                            size={20}
                                            color={colors.textDim}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Sign In button */}
                                <TouchableOpacity
                                    style={[styles.btn, { backgroundColor: colors.accent }, loading && { opacity: 0.6 }]}
                                    onPress={handleLogin}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    {loading
                                        ? <ActivityIndicator color="#000" />
                                        : (
                                            <View style={styles.btnInner}>
                                                <Text style={styles.btnText}>Sign In</Text>
                                                <Feather name="arrow-right" size={18} color="#000" style={{ marginLeft: 8 }} />
                                            </View>
                                        )
                                    }
                                </TouchableOpacity>
                            </View>

                            {/* Footer hint */}
                            <Text style={[styles.hint, { color: colors.textDim }]}>
                                Sign in with your Staff or Owner credentials
                            </Text>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    inner: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingVertical: 48,
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
    },

    // Background decorative glow
    glowOrb: {
        position: 'absolute',
        top: -120,
        alignSelf: 'center',
        width: 340,
        height: 340,
        borderRadius: 170,
    },

    // The single unified card
    card: {
        borderRadius: 28,
        borderWidth: 1,
        overflow: 'hidden',
        // Accent-tinted shadow
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 16,
    },

    // Lime-green top bar
    accentBar: {
        height: 4,
        width: '100%',
    },

    // Logo block
    logoArea: {
        alignItems: 'center',
        paddingTop: 32,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    logoRing: {
        width: 120,
        height: 120,
        borderRadius: 30,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    logoImage: {
        width: 120,
        height: 120,
    },
    appName: {
        fontSize: 20,
        marginBottom: 10,
        letterSpacing: 20,
    },
    badgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 99,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },

    // Divider
    divider: {
        height: 1,
        marginHorizontal: 0,
    },

    // Form section
    formBody: {
        padding: 24,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    input: {
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 16,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
    },
    eyeBtn: {
        paddingLeft: 10,
    },
    btn: {
        marginTop: 24,
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#65a30d',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    btnInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    btnText: {
        fontWeight: '800',
        fontSize: 16,
        color: '#000',
        letterSpacing: 0.3,
    },

    // Footer
    hint: {
        textAlign: 'center',
        fontSize: 12,
        paddingBottom: 20,
        fontStyle: 'italic',
    },
});
