import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, statusColor } from '../theme';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const color = statusColor(status);
    const fontSize = size === 'sm' ? 11 : 12;
    const py = size === 'sm' ? 3 : 5;
    const px = size === 'sm' ? 8 : 10;

    return (
        <View style={[styles.badge, { backgroundColor: color + '22', paddingVertical: py, paddingHorizontal: px }]}>
            <Text style={[styles.text, { color, fontSize }]}>{status}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        borderRadius: 99,
        alignSelf: 'flex-start',
    },
    text: {
        fontWeight: '700',
    },
});
