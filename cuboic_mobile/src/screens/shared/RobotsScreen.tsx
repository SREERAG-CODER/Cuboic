import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, ActivityIndicator,
    RefreshControl, TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { robotsApi, type Robot } from '../../api/deliveries';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StatusBadge } from '../../components/StatusBadge';
import { S, getStatusColor, FONT } from '../../theme';

export function RobotsScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
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
        <View style={[S.screen, { backgroundColor: colors.bg }]}>
            <ActivityIndicator style={{ marginTop: 80 }} color={colors.accent} size="large" />
        </View>
    );

    return (
        <ScrollView
            style={[S.screen, { backgroundColor: colors.bg }]}
            contentContainerStyle={styles.body}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Robot Fleet</Text>
                    <Text style={[styles.sub, { color: colors.textMuted }]}>{online} / {robots.length} online</Text>
                </View>
                <TouchableOpacity style={[styles.refreshBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]} onPress={load} activeOpacity={0.8}>
                    <Text style={[styles.refreshText, { color: colors.textMuted }]}>↻ Refresh</Text>
                </TouchableOpacity>
            </View>

            {robots.length === 0 ? (
                <View style={styles.empty}>
                    <Feather name="cpu" size={48} color={colors.textMuted} style={{ marginBottom: 12 }} />
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>No robots registered</Text>
                </View>
            ) : (
                <View style={styles.grid}>
                    {robots.map(robot => (
                        <View key={robot.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: getStatusColor(robot.status, colors) + '44' }]}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.robotIcon, { backgroundColor: colors.surface2 }]}>
                                    <Feather name="cpu" size={24} color={colors.accent} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.robotName, { color: colors.text }]}>{robot.name}</Text>
                                    <View style={styles.statusRow}>
                                        <View style={[styles.dot, { backgroundColor: robot.isOnline ? colors.green : colors.textDim }]} />
                                        <Text style={[styles.onlineText, { color: colors.textMuted }]}>{robot.isOnline ? 'Online' : 'Offline'}</Text>
                                    </View>
                                </View>
                                <StatusBadge status={robot.status} size="sm" />
                            </View>

                            {/* Battery */}
                            <View style={styles.batteryRow}>
                                <View style={styles.batteryLabelContainer}>
                                    <Feather name="battery" size={14} color={colors.textMuted} />
                                    <Text style={[styles.batteryLabel, { color: colors.textMuted }]}>{robot.battery ?? 0}%</Text>
                                </View>
                                <View style={[styles.batteryBar, { backgroundColor: colors.surface2 }]}>
                                    <View style={[
                                        styles.batteryFill,
                                        {
                                            width: `${robot.battery ?? 0}%` as any,
                                            backgroundColor: (robot.battery ?? 0) > 30 ? colors.green : colors.red,
                                        },
                                    ]} />
                                </View>
                            </View>

                            {/* Cabinets */}
                            {robot.cabinets && robot.cabinets.length > 0 && (
                                <View style={styles.cabinets}>
                                    <Text style={[styles.cabinetsLabel, { color: colors.textDim }]}>CABINETS</Text>
                                    <View style={styles.cabinetsRow}>
                                        {robot.cabinets.map(cab => (
                                            <View
                                                key={cab.id}
                                                style={[
                                                    styles.cabBadge,
                                                    { backgroundColor: cab.status === 'Free' ? colors.green + '22' : colors.amber + '22' },
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.cabBadgeText,
                                                    { color: cab.status === 'Free' ? colors.green : colors.amber },
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
                                    <Feather name="map-pin" size={12} color={colors.textDim} />
                                    <Text style={[styles.location, { color: colors.textDim }]}>
                                        ({robot.location.x?.toFixed(1)}, {robot.location.y?.toFixed(1)})
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}

            <Text style={[styles.hint, { color: colors.textDim }]}>Auto-refreshes every 10 seconds</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    body: { padding: 16, paddingBottom: 40 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 48, marginBottom: 20,
    },
    title: { fontSize: 26, fontWeight: '800' },
    sub: { fontSize: 13, marginTop: 2 },
    refreshBtn: {
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 8, borderWidth: 1,
    },
    refreshText: { fontSize: 13, fontWeight: '600' },
    empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 14 },
    grid: { gap: 14 },
    card: {
        borderRadius: 16,
        borderWidth: 1, padding: 16, gap: 12,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    robotIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    robotName: { fontSize: 16, fontWeight: '700' },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    dot: { width: 7, height: 7, borderRadius: 99 },
    onlineText: { fontSize: 12 },
    batteryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    batteryLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 70 },
    batteryLabel: { fontSize: 13 },
    batteryBar: {
        flex: 1, height: 6,
        borderRadius: 99, overflow: 'hidden',
    },
    batteryFill: { height: 6, borderRadius: 99 },
    cabinets: { gap: 6 },
    cabinetsLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    cabinetsRow: { flexDirection: 'row', gap: 8 },
    cabBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
    cabBadgeText: { fontSize: 12, fontWeight: '700' },
    locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    location: { fontSize: 12 },
    hint: { textAlign: 'center', fontSize: 12, marginTop: 24 },
});
