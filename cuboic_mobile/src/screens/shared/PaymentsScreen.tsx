import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, ActivityIndicator,
    RefreshControl, TouchableOpacity, TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { paymentsApi, type Payment } from '../../api/payments';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { KpiCard } from '../../components/KpiCard';
import { COLORS, S } from '../../theme';

export function PaymentsScreen() {
    const { user } = useAuth();
    const restaurantId = user?.restaurantId ?? '';

    const [payments, setPayments] = useState<Payment[]>([]);
    const [summary, setSummary] = useState<{ order_count: number; total_revenue: number } | null>(null);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        if (!restaurantId) return;
        try {
            const [sumData, payData] = await Promise.all([
                paymentsApi.getSummary(restaurantId),
                paymentsApi.findAll(restaurantId, from || undefined, to || undefined),
            ]);
            setSummary(sumData);
            setPayments(payData);
        } catch { /* ignore */ }
    }, [restaurantId, from, to]);

    useEffect(() => { load().finally(() => setLoading(false)); }, [restaurantId]);

    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const totalFiltered = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);

    if (loading) return (
        <View style={S.screen}>
            <ActivityIndicator style={{ marginTop: 80 }} color={COLORS.accent} size="large" />
        </View>
    );

    return (
        <FlatList
            style={S.screen}
            contentContainerStyle={styles.body}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
            ListHeaderComponent={
                <View>
                    <View style={styles.header}>
                        <Text style={styles.title}>Payments</Text>
                    </View>

                    {/* KPI Cards */}
                    {summary && (
                        <View style={styles.kpiRow}>
                            <KpiCard
                                icon={<Feather name="dollar-sign" size={24} color="#22c55e" />}
                                value={`₹${summary.total_revenue.toFixed(0)}`}
                                label="Today's Revenue"
                                sub="paid orders"
                                accentColor="#22c55e"
                            />
                            <KpiCard
                                icon={<Feather name="hash" size={24} color="#38bdf8" />}
                                value={summary.order_count}
                                label="Today's Orders"
                                sub="completed"
                                accentColor="#38bdf8"
                            />
                        </View>
                    )}

                    {/* Date filter */}
                    <View style={styles.filterRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.filterLabel}>From</Text>
                            <TextInput
                                style={styles.filterInput}
                                value={from}
                                onChangeText={setFrom}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={COLORS.textDim}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.filterLabel}>To</Text>
                            <TextInput
                                style={styles.filterInput}
                                value={to}
                                onChangeText={setTo}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={COLORS.textDim}
                            />
                        </View>
                        <View style={{ gap: 8 }}>
                            <TouchableOpacity style={styles.filterBtn} onPress={load} activeOpacity={0.8}>
                                <Text style={styles.filterBtnText}>Filter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.filterBtnReset}
                                onPress={() => { setFrom(''); setTo(''); }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.filterBtnResetText}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {payments.length > 0 && (
                        <View style={styles.filterSummary}>
                            <Text style={styles.filterSummaryText}>
                                {payments.length} payment(s) · Paid total:{' '}
                                <Text style={{ color: COLORS.green, fontWeight: '700' }}>₹{totalFiltered.toFixed(2)}</Text>
                            </Text>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>PAYMENT RECORDS</Text>
                </View>
            }
            data={payments}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <View style={styles.payCard}>
                    <View style={styles.payRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.payId}>#{typeof item.orderId === 'string' ? item.orderId.slice(-6).toUpperCase() : '—'}</Text>
                            <Text style={styles.payTime}>{new Date(item.createdAt).toLocaleString()}</Text>
                        </View>
                        <StatusBadge status={item.status} size="sm" />
                    </View>
                    <View style={styles.payDetails}>
                        <Text style={styles.payMethod}>{item.method}</Text>
                        <Text style={styles.payAmount}>₹{item.amount.toFixed(2)}</Text>
                    </View>
                    {item.transactionid && (
                        <Text style={styles.payTxn}>TXN: {item.transactionid}</Text>
                    )}
                </View>
            )}
            ListEmptyComponent={
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No payments found</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    body: { padding: 16, paddingBottom: 40, gap: 12 },
    header: { paddingTop: 44, paddingBottom: 16 },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
    kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
    filterRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end', marginBottom: 4 },
    filterLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginBottom: 6 },
    filterInput: {
        backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1,
        borderColor: COLORS.border, padding: 10, color: COLORS.text, fontSize: 13,
    },
    filterBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
    filterBtnText: { color: '#0f0f13', fontWeight: '700', fontSize: 13 },
    filterBtnReset: {
        backgroundColor: COLORS.surface2, paddingHorizontal: 14, paddingVertical: 9,
        borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
    },
    filterBtnResetText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
    filterSummary: {
        backgroundColor: COLORS.surface, borderRadius: 10, padding: 12,
        borderWidth: 1, borderColor: COLORS.border,
    },
    filterSummaryText: { fontSize: 13, color: COLORS.textMuted },
    sectionTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textDim, letterSpacing: 1.2, marginBottom: 0 },
    payCard: {
        backgroundColor: COLORS.surface, borderRadius: 12,
        borderWidth: 1, borderColor: COLORS.border, padding: 14, gap: 8,
    },
    payRow: { flexDirection: 'row', alignItems: 'flex-start' },
    payId: { fontSize: 13, fontWeight: '700', color: COLORS.text, fontVariant: ['tabular-nums'] },
    payTime: { fontSize: 11, color: COLORS.textDim, marginTop: 2 },
    payDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    payMethod: { fontSize: 13, color: COLORS.textMuted },
    payAmount: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    payTxn: { fontSize: 11, color: COLORS.textDim },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyText: { color: COLORS.textMuted, fontSize: 14 },
});
