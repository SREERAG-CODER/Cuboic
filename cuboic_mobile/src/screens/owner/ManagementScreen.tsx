import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export function ManagementScreen({ navigation }: any) {
    const { user } = useAuth();
    const isOwner = user?.role === 'Owner';

    const options = [
        { name: 'Menu', icon: 'book-open', screen: 'Menu', color: COLORS.blue, desc: 'Manage categories and items' },
        ...(isOwner ? [
            { name: 'Staff', icon: 'users', screen: 'Staff', color: COLORS.purple, desc: 'Manage your restaurant team' },
            { name: 'Tables', icon: 'grid', screen: 'Tables', color: COLORS.amber, desc: 'Configure dining areas' },
            { name: 'Payments', icon: 'credit-card', screen: 'Payments', color: COLORS.green, desc: 'View transaction history' },
        ] : []),
    ];

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.body}>
                <View style={styles.header}>
                    <Text style={styles.title}>Management</Text>
                    <Text style={styles.subtitle}>Configure and oversee operations</Text>
                </View>

                <View style={styles.grid}>
                    {options.map((opt) => (
                        <TouchableOpacity
                            key={opt.name}
                            style={styles.card}
                            onPress={() => navigation.navigate(opt.screen)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: opt.color + '15' }]}>
                                <Feather name={opt.icon as any} size={24} color={opt.color} />
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardText}>{opt.name}</Text>
                                <Text style={styles.cardDesc}>{opt.desc}</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color={COLORS.textDim} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.bg },
    body: { padding: 16, paddingTop: 60 },
    header: { marginBottom: 32, paddingHorizontal: 4 },
    title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
    subtitle: { fontSize: 15, color: COLORS.textMuted, marginTop: 4 },
    grid: { gap: 12 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardInfo: { flex: 1 },
    cardText: { fontSize: 17, fontWeight: '700', color: COLORS.text },
    cardDesc: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
});
