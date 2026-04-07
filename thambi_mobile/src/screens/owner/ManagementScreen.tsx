import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { S } from '../../theme';

export function ManagementScreen({ navigation }: any) {
    const { user } = useAuth();
    const { colors } = useTheme();
    const isOwner = user?.role === 'Owner';

    const options = [
        { name: 'Menu', icon: 'book-open', screen: 'Menu', color: '#60a5fa', desc: 'Manage categories and items' },
        ...(isOwner ? [
            { name: 'Staff', icon: 'users', screen: 'Staff', color: '#c084fc', desc: 'Manage your restaurant team' },
            { name: 'Tables', icon: 'grid', screen: 'Tables', color: '#fbbf24', desc: 'Configure dining areas' },
            { name: 'Payments', icon: 'credit-card', screen: 'Payments', color: '#4ade80', desc: 'View transaction history' },
        ] : []),
    ];

    return (
        <View style={[S.screen, { backgroundColor: colors.bg }]}>
            <ScrollView contentContainerStyle={styles.body}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Management</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>Configure and oversee operations</Text>
                </View>

                <View style={styles.grid}>
                    {options.map((opt) => (
                        <TouchableOpacity
                            key={opt.name}
                            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => navigation.navigate(opt.screen)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: opt.color + '15' }]}>
                                <Feather name={opt.icon as any} size={24} color={opt.color} />
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={[styles.cardText, { color: colors.text }]}>{opt.name}</Text>
                                <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{opt.desc}</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color={colors.textDim} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    body: { padding: 16, paddingTop: 60 },
    header: {
        marginBottom: 32, paddingHorizontal: 4 },
    title: { fontSize: 28, fontWeight: '800' },
    subtitle: { fontSize: 15, marginTop: 4 },
    grid: { gap: 12 },
    card: {
        ...S.shadow,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,





    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardInfo: {
        flex: 1 },
    cardText: { fontSize: 17, fontWeight: '700' },
    cardDesc: {
        fontSize: 13, marginTop: 2 },
});
