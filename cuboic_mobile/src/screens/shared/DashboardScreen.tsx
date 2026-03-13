import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, ActivityIndicator,
    TouchableOpacity, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api/orders';
import { paymentsApi } from '../../api/payments';
import { deliveriesApi, robotsApi } from '../../api/deliveries';
import { useSocket } from '../../hooks/useSocket';
import { KpiCard } from '../../components/KpiCard';
import { COLORS } from '../../theme';

export function DashboardScreen() {
    const { user, logout } = useAuth();
    const restaurantId = user?.restaurantId ?? '';

    const [summary, setSummary] = useState({ order_count: 0, total_revenue: 0 });
    const [orderSummary, setOrderSummary] = useState({ pending: 0, preparing: 0, completed: 0 });
    const [activeDeliveries, setActiveDeliveries] = useState(0);
    const [robotsOnline, setRobotsOnline] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        if (!restaurantId) return;

        if (user?.role === 'Owner') {
            try {
                const s = await paymentsApi.getSummary(restaurantId);
                setSummary(s);
            } catch { /* ignore */ }
        }

        try {
            const [deliveries, robots, orderSum] = await Promise.all([
                deliveriesApi.findActive(restaurantId),
                robotsApi.findAll(restaurantId),
                ordersApi.getSummary(restaurantId),
            ]);
            setActiveDeliveries(deliveries.length);
            setRobotsOnline(robots.filter(r => r.isOnline).length);
            setOrderSummary(orderSum);
        } catch { /* ignore */ }
    }, [restaurantId, user?.role]);

    useEffect(() => {
        load().finally(() => setLoading(false));
    }, [load]);

    useSocket(restaurantId, {
        'order:new': () => load(),
        'order:updated': () => load(),
        'delivery:started': () => load(),
        'delivery:updated': () => load(),
    });

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const kpis = [
        ...(user?.role === 'Owner' ? [
            { icon: <Feather name="hash" size={24} color={COLORS.blue} />, value: summary.order_count, label: "Today's Orders", sub: 'paid today', color: COLORS.blue },
            { icon: <Feather name="dollar-sign" size={24} color={COLORS.green} />, value: `₹${summary.total_revenue.toFixed(0)}`, label: "Today's Revenue", sub: 'before tax', color: COLORS.green },
        ] : []),
        { icon: <Feather name="clock" size={24} color={COLORS.amber} />, value: orderSummary.pending, label: 'Pending Orders', sub: 'action needed', color: COLORS.amber },
        { icon: <Feather name="coffee" size={24} color={COLORS.blue} />, value: orderSummary.preparing, label: 'Preparing', sub: 'in kitchen', color: COLORS.blue },
        { icon: <Feather name="check-circle" size={24} color={COLORS.green} />, value: orderSummary.completed, label: 'Completed Today', sub: 'delivered', color: COLORS.green },
        { icon: <Feather name="box" size={24} color={COLORS.amber} />, value: activeDeliveries, label: 'Active Deliveries', sub: 'in transit', color: COLORS.amber },
        { icon: <Feather name="cpu" size={24} color={COLORS.purple} />, value: robotsOnline, label: 'Robots Online', sub: 'connected', color: COLORS.purple },
    ];

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.body}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back, {user?.name?.split(' ')[0]}</Text>
                    <Text style={styles.role}>{user?.role} Dashboard</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.8}>
                    <Text style={styles.logoutText}>Sign out</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
            ) : (
                <View style={styles.grid}>
                    {kpis.map(k => (
                        <KpiCard
                            key={k.label}
                            icon={k.icon}
                            value={k.value}
                            label={k.label}
                            sub={k.sub}
                            accentColor={k.color}
                        />
                    ))}
                </View>
            )}

            <Text style={styles.hint}>
                Real-time updates active — pull to refresh manually
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.bg },
    body: { padding: 16, paddingBottom: 40 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 44,
        paddingBottom: 24,
    },
    greeting: { fontSize: 20, fontWeight: '800', color: COLORS.text },
    role: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
    logoutBtn: {
        backgroundColor: COLORS.surface2,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    logoutText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    hint: {
        textAlign: 'center',
        color: COLORS.textDim,
        fontSize: 12,
        paddingHorizontal: 16,
    },
});
