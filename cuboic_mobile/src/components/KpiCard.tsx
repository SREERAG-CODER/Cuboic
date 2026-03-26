import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';

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
    accentColor = COLORS.accent, 
    fullWidth = false,
    onPress 
}: KpiCardProps) {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container 
            style={[
                styles.card, 
                { borderColor: accentColor + '33' },
                fullWidth && styles.fullWidth
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={[styles.iconWrapper, { backgroundColor: accentColor + '15' }]}>
                    {typeof icon === 'string' ? <Text style={styles.icon}>{icon}</Text> : icon}
                </View>
                <View style={styles.info}>
                    <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
                    <Text style={styles.label}>{label}</Text>
                    {sub && <Text style={styles.sub}>{sub}</Text>}
                </View>
                {onPress && (
                    <View style={styles.chevron}>
                        <Text style={{ color: COLORS.textDim }}>{'>'}</Text>
                    </View>
                )}
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
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
    label: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
    sub: { fontSize: 11, color: COLORS.textDim, marginTop: 2 },
    chevron: {
        paddingLeft: 8,
    }
});
