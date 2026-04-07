import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, ActivityIndicator,
    RefreshControl, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { paymentsApi, platformFeesApi, type Payment, type PlatformFee, type PlatformFeeSummary } from '../../api/payments';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StatusBadge } from '../../components/StatusBadge';
import { KpiCard } from '../../components/KpiCard';
import { S, FONT } from '../../theme';
import { useNavigation } from '@react-navigation/native';

export function PaymentsScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const restaurantId = user?.restaurantId ?? '';
    const isOwner = user?.role === 'Owner';

    const [payments, setPayments] = useState<Payment[]>([]);
    const [summary, setSummary] = useState<{ order_count: number; total_revenue: number } | null>(null);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Platform fees state (Owner only)
    const [fees, setFees] = useState<PlatformFee[]>([]);
    const [feeSummary, setFeeSummary] = useState<PlatformFeeSummary | null>(null);
    const [payingFeeId, setPayingFeeId] = useState<string | null>(null);

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

        if (isOwner) {
            try {
                const [feeData, feeSumData] = await Promise.all([
                    platformFeesApi.findAll(restaurantId),
                    platformFeesApi.getSummary(restaurantId),
                ]);
                setFees(feeData);
                setFeeSummary(feeSumData);
            } catch { /* ignore */ }
        }
    }, [restaurantId, from, to, isOwner]);

    useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const handleMarkFeePaid = async (feeId: string) => {
        Alert.alert('Mark as Paid', 'Confirm that you have paid ₹5 to Thambi for this order?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Yes, Mark Paid',
                style: 'default',
                onPress: async () => {
                    setPayingFeeId(feeId);
                    try {
                        await platformFeesApi.markAsPaid(feeId);
                        await load();
                    } catch {
                        Alert.alert('Error', 'Failed to mark fee as paid.');
                    } finally {
                        setPayingFeeId(null);
                    }
                },
            },
        ]);
    };

    const totalFiltered = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
    const unpaidFees = fees.filter(f => !f.isPaid);
    const paidFees = fees.filter(f => f.isPaid);

    if (loading) return (
        <View style={[S.screen, { backgroundColor: colors.bg }]}>
            <ActivityIndicator style={{ marginTop: 80 }} color={colors.accent} size="large" />
        </View>
    );

    const FeeCard = ({ item }: { item: PlatformFee }) => (
        <View style={[styles.feeCard, { backgroundColor: colors.surface2, borderColor: colors.border }, item.isPaid && styles.feeCardPaid]}>
            <View style={styles.feeRow}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.feeOrderId, { color: colors.text }]}>
                        Order #{item.orderId.slice(-6).toUpperCase()}
                    </Text>
                    <Text style={[styles.feeTime, { color: colors.textDim }]}>
                        {new Date(item.createdAt).toLocaleString()}
                    </Text>
                    {item.order && (
                        <Text style={[styles.feeOrderTotal, { color: colors.textMuted }]}>
                            Order total: ₹{item.order.total.toFixed(2)}
                        </Text>
                    )}
                </View>
                <View style={styles.feeRight}>
                    <Text style={[styles.feeAmount, { color: colors.amber }]}>₹{item.amount.toFixed(0)}</Text>
                    {item.isPaid ? (
                        <View style={[styles.paidBadge, { backgroundColor: colors.green + '22' }]}>
                            <Feather name="check-circle" size={12} color={colors.green} />
                            <Text style={[styles.paidBadgeText, { color: colors.green }]}>Paid</Text>
                        </View>
                    ) : (
                        user?.role === 'Admin' && (
                            <TouchableOpacity
                                style={[styles.markPaidBtn, { backgroundColor: colors.accent }]}
                                onPress={() => handleMarkFeePaid(item.id)}
                                disabled={payingFeeId === item.id}
                                activeOpacity={0.8}
                            >
                                {payingFeeId === item.id
                                    ? <ActivityIndicator size="small" color="#0f0f13" />
                                    : <Text style={styles.markPaidBtnText}>Mark Paid</Text>
                                }
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <FlatList
            style={[S.screen, { backgroundColor: colors.bg }]}
            contentContainerStyle={styles.body}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
            ListHeaderComponent={
                <View>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surface2 }]}>
                                <Feather name="arrow-left" size={20} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.title, { color: colors.text }]}>Payments</Text>
                        </View>
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

                    {/* ── Amount Payable to Thambi (Owner only) ── */}
                    {isOwner && feeSummary && (
                        <View style={[styles.thambiSection, { backgroundColor: colors.surface, borderColor: colors.amber }]}>
                            <View style={styles.thambiHeader}>
                                <Feather name="alert-circle" size={16} color={colors.amber} />
                                <Text style={[styles.thambiTitle, { color: colors.amber }]}>Amount Payable to Thambi</Text>
                            </View>
                            <Text style={[styles.thambiSubtitle, { color: colors.textMuted }]}>
                                ₹5 is owed for each order above ₹100
                            </Text>

                            <View style={styles.thambiKpiRow}>
                                <View style={[styles.thambiKpi, { backgroundColor: colors.surface2, borderColor: colors.border }, styles.thambiKpiDue]}>
                                    <Text style={[styles.thambiKpiValue, { color: colors.amber }]}>₹{feeSummary.totalOwed.toFixed(0)}</Text>
                                    <Text style={[styles.thambiKpiLabel, { color: colors.textMuted }]}>Outstanding</Text>
                                    <Text style={[styles.thambiKpiSub, { color: colors.textDim }]}>{feeSummary.unpaidCount} order(s)</Text>
                                </View>
                                <View style={[styles.thambiKpi, { backgroundColor: colors.surface2, borderColor: colors.border }, styles.thambiKpiPaid]}>
                                    <Text style={[styles.thambiKpiValue, { color: colors.green }]}>₹{feeSummary.totalPaid.toFixed(0)}</Text>
                                    <Text style={[styles.thambiKpiLabel, { color: colors.textMuted }]}>Paid so far</Text>
                                    <Text style={[styles.thambiKpiSub, { color: colors.textDim }]}>{fees.length - feeSummary.unpaidCount} order(s)</Text>
                                </View>
                            </View>

                            {unpaidFees.length > 0 && (
                                <>
                                    <Text style={[styles.feeListLabel, { color: colors.textDim }]}>PENDING FEES</Text>
                                    {unpaidFees.map(f => <FeeCard key={f.id} item={f} />)}
                                </>
                            )}

                            {paidFees.length > 0 && (
                                <>
                                    <Text style={[styles.feeListLabel, { color: colors.textDim, marginTop: 12 }]}>PAID FEES</Text>
                                    {paidFees.map(f => <FeeCard key={f.id} item={f} />)}
                                </>
                            )}

                            {fees.length === 0 && (
                                <View style={styles.feeEmpty}>
                                    <Feather name="check-circle" size={20} color={colors.green} />
                                    <Text style={[styles.feeEmptyText, { color: colors.textMuted }]}>No fees yet</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Date filter */}
                    <View style={styles.filterRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.filterLabel, { color: colors.textMuted }]}>From</Text>
                            <TextInput
                                style={[styles.filterInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                                value={from}
                                onChangeText={setFrom}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.textDim}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.filterLabel, { color: colors.textMuted }]}>To</Text>
                            <TextInput
                                style={[styles.filterInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                                value={to}
                                onChangeText={setTo}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.textDim}
                            />
                        </View>
                        <View style={{ gap: 8 }}>
                            <TouchableOpacity style={[styles.filterBtn, { backgroundColor: colors.accent }]} onPress={load} activeOpacity={0.8}>
                                <Text style={styles.filterBtnText}>Filter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterBtnReset, { backgroundColor: colors.surface2, borderColor: colors.border }]}
                                onPress={() => { setFrom(''); setTo(''); }}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.filterBtnResetText, { color: colors.textMuted }]}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {payments.length > 0 && (
                        <View style={[styles.filterSummary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.filterSummaryText, { color: colors.textMuted }]}>
                                {payments.length} payment(s) · Paid total:{' '}
                                <Text style={{ color: colors.green, fontWeight: '700' }}>₹{totalFiltered.toFixed(2)}</Text>
                            </Text>
                        </View>
                    )}

                    <Text style={[styles.sectionTitle, { color: colors.textDim }]}>PAYMENT RECORDS</Text>
                </View>
            }
            data={payments}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <View style={[styles.payCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.payRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.payId, { color: colors.text }]}>#{typeof item.orderId === 'string' ? item.orderId.slice(-6).toUpperCase() : '—'}</Text>
                            <Text style={[styles.payTime, { color: colors.textDim }]}>{new Date(item.createdAt).toLocaleString()}</Text>
                        </View>
                        <StatusBadge status={item.status} size="sm" />
                    </View>
                    <View style={styles.payDetails}>
                        <Text style={[styles.payMethod, { color: colors.textMuted }]}>{item.method}</Text>
                        <Text style={[styles.payAmount, { color: colors.text }]}>₹{item.amount.toFixed(2)}</Text>
                    </View>
                    {item.transactionid && (
                        <Text style={[styles.payTxn, { color: colors.textDim }]}>TXN: {item.transactionid}</Text>
                    )}
                </View>
            )}
            ListEmptyComponent={
                <View style={styles.empty}>
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>No payments found</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    body: { padding: 16, paddingBottom: 40, gap: 12 },
    header: {
        ...S.shadow, paddingTop: 48, paddingBottom: 16 },
    backBtn: {
        ...S.shadow, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 26, fontWeight: '800' },
    kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },

    // ── Thambi section ──────────────────────────────────────
    thambiSection: {
        borderRadius: 14,
        borderWidth: 1.5,
        padding: 16,
        gap: 10,
        marginBottom: 4,
    },
    thambiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    thambiTitle: { fontSize: 15, fontWeight: '800' },
    thambiSubtitle: { fontSize: 12, marginTop: -4 },
    thambiKpiRow: { flexDirection: 'row', gap: 10 },
    thambiKpi: {
        flex: 1, borderRadius: 10, padding: 12, gap: 2,
        borderWidth: 1,
    },
    thambiKpiDue: { borderColor: '#f59e0b33' },
    thambiKpiPaid: { borderColor: '#22c55e33' },
    thambiKpiValue: { fontSize: 22, fontWeight: '800' },
    thambiKpiLabel: { fontSize: 11, fontWeight: '600' },
    thambiKpiSub: { fontSize: 10 },
    feeListLabel: {
        fontSize: 10, fontWeight: '700',
        letterSpacing: 1.2, marginBottom: 4, marginTop: 4,
    },
    feeCard: {
        ...S.shadow,
        borderRadius: 10,
        borderWidth: 1, padding: 12,
    },
    feeCardPaid: { opacity: 0.55 },
    feeRow: { flexDirection: 'row', alignItems: 'center' },
    feeOrderId: { fontSize: 13, fontWeight: '700' },
    feeTime: { fontSize: 11, marginTop: 1 },
    feeOrderTotal: { fontSize: 11, marginTop: 1 },
    feeRight: { alignItems: 'flex-end', gap: 6 },
    feeAmount: { fontSize: 18, fontWeight: '800' },
    markPaidBtn: {
        ...S.shadow,
        paddingHorizontal: 12,
        paddingVertical: 6, borderRadius: 7,
    },
    markPaidBtnText: { color: '#0f0f13', fontWeight: '700', fontSize: 12 },
    paidBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4, borderRadius: 6,
    },
    paidBadgeText: { fontSize: 11, fontWeight: '700' },
    feeEmpty: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        justifyContent: 'center', paddingVertical: 12,
    },
    feeEmptyText: { fontSize: 13 },

    // ── Date filter ─────────────────────────────────────────
    filterRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end', marginBottom: 4 },
    filterLabel: { fontSize: 11, fontWeight: '600', marginBottom: 6 },
    filterInput: {
        ...S.shadow,
        borderRadius: 10, borderWidth: 1,
        padding: 10, fontSize: 13,
    },
    filterBtn: {
        ...S.shadow, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
    filterBtnText: { color: '#0f0f13', fontWeight: '700', fontSize: 13 },
    filterBtnReset: {
        ...S.shadow,
        paddingHorizontal: 14, paddingVertical: 9,
        borderRadius: 8, borderWidth: 1, alignItems: 'center',
    },
    filterBtnResetText: { fontWeight: '600', fontSize: 13 },
    filterSummary: {
        borderRadius: 10, padding: 12,
        borderWidth: 1,
    },
    filterSummaryText: { fontSize: 13 },
    sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 0 },

    // ── Payment records ─────────────────────────────────────
    payCard: {
        ...S.shadow,
        borderRadius: 12,
        borderWidth: 1, padding: 14, gap: 8,
    },
    payRow: { flexDirection: 'row', alignItems: 'flex-start' },
    payId: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
    payTime: { fontSize: 11, marginTop: 2 },
    payDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    payMethod: { fontSize: 13 },
    payAmount: { fontSize: 16, fontWeight: '700' },
    payTxn: { fontSize: 11 },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 14 },
});
