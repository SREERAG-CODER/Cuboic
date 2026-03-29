import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, ActivityIndicator,
    RefreshControl, TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { robotsApi, type Robot } from '../../api/deliveries';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { COLORS, S, statusColor } from '../../theme';

export function RobotsScreen() {
    const { user } = useAuth();
    const restaurantId = user?.restaurantId ?? '';
    const [robots, setRobots] = useState<Robot[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        if (!restaurantId) return;
        try {
            const data = await robotsApi.findAll(restaurantId);
            setRobots(data);
        } catch { /* ignore */ }
    }, [restaurantId]);

    useEffect(() => {
        load().finally(() => setLoading(false));
        const interval = setInterval(load, 10000);
        return () => clearInterval(interval);
    }, [load]);

    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const online = robots.filter(r => r.isOnline).length;

    if (loading) return (
        <View style={S.screen}>
            <ActivityIndicator style={{ marginTop: 80 }} color={COLORS.accent} size="large" />
        </View>
    );

    return (
        <ScrollView
            style={S.screen}
            contentContainerStyle={styles.body}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Robot Fleet</Text>
                    <Text style={styles.sub}>{online} / {robots.length} online</Text>
                </View>
                <TouchableOpacity style={styles.refreshBtn} onPress={load} activeOpacity={0.8}>
                    <Text style={styles.refreshText}>↻ Refresh</Text>
                </TouchableOpacity>
            </View>

            {robots.length === 0 ? (
                <View style={styles.empty}>
                    <Feather name="cpu" size={48} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
                    <Text style={styles.emptyText}>No robots registered</Text>
                </View>
            ) : (
                <View style={styles.grid}>
                    {robots.map(robot => (
                        <View key={robot.id} style={[styles.card, { borderColor: statusColor(robot.status) + '44' }]}>
                            <View style={styles.cardHeader}>
                                <View style={styles.robotIcon}>
                                    <Feather name="cpu" size={24} color={COLORS.accent} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.robotName}>{robot.name}</Text>
                                    <View style={styles.statusRow}>
                                        <View style={[styles.dot, { backgroundColor: robot.isOnline ? COLORS.green : COLORS.textDim }]} />
                                        <Text style={styles.onlineText}>{robot.isOnline ? 'Online' : 'Offline'}</Text>
                                    </View>
                                </View>
                                <StatusBadge status={robot.status} size="sm" />
                            </View>

                            {/* Battery */}
                            <View style={styles.batteryRow}>
                                <View style={styles.batteryLabelContainer}>
                                    <Feather name="battery" size={14} color={COLORS.textMuted} />
                                    <Text style={styles.batteryLabel}>{robot.battery ?? 0}%</Text>
                                </View>
                                <View style={styles.batteryBar}>
                                    <View style={[
                                        styles.batteryFill,
                                        {
                                            width: `${robot.battery ?? 0}%` as any,
                                            backgroundColor: (robot.battery ?? 0) > 30 ? COLORS.green : COLORS.red,
                                        },
                                    ]} />
                                </View>
                            </View>

                            {/* Cabinets */}
                            {robot.cabinets && robot.cabinets.length > 0 && (
                                <View style={styles.cabinets}>
                                    <Text style={styles.cabinetsLabel}>CABINETS</Text>
                                    <View style={styles.cabinetsRow}>
                                        {robot.cabinets.map(cab => (
                                            <View
                                                key={cab.id}
                                                style={[
                                                    styles.cabBadge,
                                                    { backgroundColor: cab.status === 'Free' ? COLORS.green + '22' : COLORS.amber + '22' },
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.cabBadgeText,
                                                    { color: cab.status === 'Free' ? COLORS.green : COLORS.amber },
                                                ]}>
                                                    {cab.id}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Location */}
                            {robot.location && (
                                <View style={styles.locationContainer}>
                                    <Feather name="map-pin" size={12} color={COLORS.textDim} />
                                    <Text style={styles.location}>
                                        ({robot.location.x?.toFixed(1)}, {robot.location.y?.toFixed(1)})
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}

            <Text style={styles.hint}>Auto-refreshes every 10 seconds</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    body: { padding: 16, paddingBottom: 40 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 48, marginBottom: 20,
    },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
    sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
    refreshBtn: {
        backgroundColor: COLORS.surface2, paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
    },
    refreshText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
    empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyIcon: { fontSize: 48 },
    emptyText: { color: COLORS.textMuted, fontSize: 14 },
    grid: { gap: 14 },
    card: {
        backgroundColor: COLORS.surface, borderRadius: 16,
        borderWidth: 1, padding: 16, gap: 12,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    robotIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center' },
    robotName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    dot: { width: 7, height: 7, borderRadius: 99 },
    onlineText: { fontSize: 12, color: COLORS.textMuted },
    batteryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    batteryLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 70 },
    batteryLabel: { fontSize: 13, color: COLORS.textMuted },
    batteryBar: {
        flex: 1, height: 6, backgroundColor: COLORS.surface2,
        borderRadius: 99, overflow: 'hidden',
    },
    batteryFill: { height: 6, borderRadius: 99 },
    cabinets: { gap: 6 },
    cabinetsLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textDim, letterSpacing: 1 },
    cabinetsRow: { flexDirection: 'row', gap: 8 },
    cabBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
    cabBadgeText: { fontSize: 12, fontWeight: '700' },
    locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    location: { fontSize: 12, color: COLORS.textDim },
    hint: { textAlign: 'center', color: COLORS.textDim, fontSize: 12, marginTop: 24 },
});
