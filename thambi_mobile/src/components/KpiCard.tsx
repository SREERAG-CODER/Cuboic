import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { S } from '../theme';

interface KpiCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    sub?: string;
    accentColor?: string;
    fullWidth?: boolean;
    onPress?: () => void;
}

export function KpiCard({ 
    icon, 
    value, 
    label, 
    sub, 
    accentColor, 
    fullWidth = false,
    onPress 
}: KpiCardProps) {
    const { colors } = useTheme();
    const Container = onPress ? TouchableOpacity : View;
    const finalAccentColor = accentColor || colors.accent;

    return (
        <Container 
            style={[
                styles.card, 
                { 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    ...(fullWidth && styles.fullWidth)
                }
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={[styles.iconWrapper, { backgroundColor: finalAccentColor + '15' }]}>
                    {typeof icon === 'string' ? <Text style={styles.icon}>{icon}</Text> : icon}
                </View>
                <View style={styles.info}>
                    <Text style={[styles.value, { color: finalAccentColor }]}>{value}</Text>
                    <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
                    {sub && <Text style={[styles.sub, { color: colors.textDim }]}>{sub}</Text>}
                </View>
                {onPress && (
                    <View style={styles.chevron}>
                        <Text style={{ color: colors.textDim }}>{'>'}</Text>
                    </View>
                )}
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    card: {
        ...S.shadow,
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        width: '47%',
        marginBottom: 12,
    },
    fullWidth: {
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    icon: { fontSize: 24 },
    value: { fontSize: 22, fontWeight: '800' },
    label: { fontSize: 13, fontWeight: '600' },
    sub: { fontSize: 11, marginTop: 2 },
    chevron: {
        paddingLeft: 8,
    }
});
