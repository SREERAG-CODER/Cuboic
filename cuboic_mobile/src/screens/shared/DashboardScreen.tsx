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
import { useNavigation } from '@react-navigation/native';

export function DashboardScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<any>();
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

    // Poll every 1 second
    useEffect(() => {
        const interval = setInterval(load, 1000);
        return () => clearInterval(interval);
    }, [load]);

    useSocket(restaurantId, {
        'order:new': () => load(),
        'order:updated': () => load(),
        'order:status': () => load(),
        'delivery:started': () => load(),
        'delivery:updated': () => load(),
    });

    const handleDrillDown = (status: string) => {
        navigation.navigate('Orders', { statusInitial: status });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const kpis = [
        ...(user?.role === 'Owner' ? [
            { 
                icon: <Feather name="dollar-sign" size={24} color={COLORS.green} />, 
                value: `₹${summary.total_revenue.toFixed(0)}`, 
                label: "Today's Revenue", 
                sub: 'Total gross revenue today', 
                color: COLORS.green,
                fullWidth: true 
            },
            { 
                icon: <Feather name="hash" size={24} color={COLORS.blue} />, 
                value: summary.order_count, 
                label: "Today's Orders", 
                sub: 'Total orders processed', 
                color: COLORS.blue,
                fullWidth: true 
            },
        ] : []),
        { 
            icon: <Feather name="alert-circle" size={24} color={COLORS.amber} />, 
            value: orderSummary.pending, 
            label: 'Pending Orders', 
            sub: 'Requires attention', 
            color: COLORS.amber, // Kept amber as it represents warning/action
            onPress: () => handleDrillDown('Pending')
        },
        { 
            icon: <Feather name="coffee" size={24} color={COLORS.purple} />, 
            value: orderSummary.preparing, 
            label: 'Preparing', 
            sub: 'Being cooked', 
            color: COLORS.purple,
            onPress: () => handleDrillDown('Confirmed') // Assuming Confirmed shows preparing items
        },
        { 
            icon: <Feather name="check-circle" size={24} color="#a7f3d0" />, // Softer green
            value: orderSummary.completed, 
            label: 'Completed', 
            sub: 'Ready / Delivered', 
            color: '#059669', // Stronger label color, soft icon
            onPress: () => handleDrillDown('Ready')
        },
        { 
            icon: <Feather name="cpu" size={24} color={COLORS.blue} />, 
            value: robotsOnline, 
            label: 'Robots', 
            sub: 'Online now', 
            color: COLORS.blue 
        },
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
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.restaurantName}>{user?.name || 'Administrator'}</Text>
                    <Text style={styles.role}>{user?.role} Overview</Text>
                </View>
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
                            fullWidth={(k as any).fullWidth}
                            onPress={(k as any).onPress}
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
        paddingTop: 48,
        paddingBottom: 24,
    },
    greeting: { fontSize: 16, fontWeight: '600', color: COLORS.textMuted },
    restaurantName: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginTop: 4 },
    role: { fontSize: 13, color: COLORS.textDim, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
    hint: {
        textAlign: 'center',
        color: COLORS.textDim,
        fontSize: 12,
        paddingHorizontal: 16,
    },
});
