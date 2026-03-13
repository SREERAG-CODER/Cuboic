import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

interface KpiCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    sub?: string;
    accentColor?: string;
}

export function KpiCard({ icon, value, label, sub, accentColor = COLORS.accent }: KpiCardProps) {
    return (
        <View style={[styles.card, { borderColor: accentColor + '44' }]}>
            {typeof icon === 'string' ? <Text style={styles.icon}>{icon}</Text> : icon}
            <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
            {sub && <Text style={styles.sub}>{sub}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        width: '47%',
        alignItems: 'center',
        gap: 4,
    },
    icon: { fontSize: 24, marginBottom: 4 },
    value: { fontSize: 26, fontWeight: '800' },
    label: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', fontWeight: '600' },
    sub: { fontSize: 11, color: COLORS.textDim, textAlign: 'center' },
});
