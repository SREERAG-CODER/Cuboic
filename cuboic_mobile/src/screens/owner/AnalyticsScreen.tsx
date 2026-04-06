import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, ScrollView, StyleSheet, ActivityIndicator,
    RefreshControl, Dimensions, TouchableOpacity, TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { analyticsApi, RevenueTrends, MenuAnalytics, CustomerInsights } from '../../api/analytics';
import { S } from '../../theme';
import { KpiCard } from '../../components/KpiCard';
import { Feather } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useSocket } from '../../hooks/useSocket';

const screenWidth = Dimensions.get('window').width;

type Timeframe = 'today' | '7d' | '30d' | '3m' | 'custom';

const CHIPS: { label: string; value: Timeframe; subLabel: string }[] = [
    { label: 'Today',    value: 'today',  subLabel: 'Today' },
    { label: '7 Days',   value: '7d',     subLabel: 'Last 7 Days' },
    { label: '30 Days',  value: '30d',    subLabel: 'Last 30 Days' },
    { label: '3 Months', value: '3m',     subLabel: 'Last 3 Months' },
    { label: 'Custom',   value: 'custom', subLabel: 'Custom Range' },
];

/**
 * Compute startDate / endDate strings (YYYY-MM-DD) for a preset timeframe.
 * Uses en-CA locale which outputs YYYY-MM-DD in LOCAL time (not UTC),
 * so "Today" always matches the user's actual calendar day.
 */
function localDate(d: Date): string {
    return d.toLocaleDateString('en-CA'); // e.g. "2026-04-06" in local tz
}

function getDateRange(tf: Timeframe): { startDate: string; endDate: string } {
    const today = new Date();
    const endDate = localDate(today);

    const sub = (days: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() - days);
        return localDate(d);
    };

    switch (tf) {
        case 'today':  return { startDate: endDate, endDate };
        case '7d':     return { startDate: sub(7),  endDate };
        case '30d':    return { startDate: sub(30), endDate };
        case '3m': {
            const d = new Date(today);
            d.setMonth(d.getMonth() - 3);
            return { startDate: localDate(d), endDate };
        }
        default:       return { startDate: sub(30), endDate };
    }
}

export function AnalyticsScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const restaurantId = user?.restaurantId ?? '';

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('30d');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    // Applied custom dates (only set when user presses Apply)
    const [appliedStart, setAppliedStart] = useState('');
    const [appliedEnd, setAppliedEnd] = useState('');

    const [revenueData, setRevenueData] = useState<RevenueTrends | null>(null);
    const [menuData, setMenuData] = useState<MenuAnalytics | null>(null);
    const [customerData, setCustomerData] = useState<CustomerInsights | null>(null);

    // The active date range — recomputed whenever state changes
    const activeDates: { startDate: string; endDate: string } = 
        selectedTimeframe === 'custom'
            ? { startDate: appliedStart, endDate: appliedEnd }
            : getDateRange(selectedTimeframe);

    const activeSubLabel =
        selectedTimeframe === 'custom' && appliedStart && appliedEnd
            ? `${appliedStart} → ${appliedEnd}`
            : CHIPS.find(c => c.value === selectedTimeframe)?.subLabel ?? '';

    const loadData = useCallback(async (startDate: string, endDate: string) => {
        if (!restaurantId || !startDate || !endDate) return;

        try {
            const [rev, menu, cust] = await Promise.all([
                analyticsApi.getRevenueTrends(restaurantId, startDate, endDate),
                analyticsApi.getMenuAnalytics(restaurantId, startDate, endDate),
                analyticsApi.getCustomerInsights(restaurantId, startDate, endDate),
            ]);

            setRevenueData(rev);
            setMenuData(menu);
            setCustomerData(cust);
        } catch (error) {
            console.error('Failed to load analytics', error);
        }
    }, [restaurantId]);

    // Keep a ref to activeDates so socket callbacks always see the latest value
    // without needing to be re-registered on every chip change.
    const activeDatesRef = useRef(activeDates);
    useEffect(() => { activeDatesRef.current = activeDates; }, [activeDates]);

    // Fire whenever restaurantId or the selected date range changes
    useEffect(() => {
        if (!activeDates.startDate || !activeDates.endDate) return;
        setLoading(true);
        loadData(activeDates.startDate, activeDates.endDate).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantId, selectedTimeframe, appliedStart, appliedEnd]);

    // Real-time: reload analytics silently when orders change
    const handleRealTimeUpdate = useCallback(() => {
        const { startDate, endDate } = activeDatesRef.current;
        if (startDate && endDate) loadData(startDate, endDate);
    }, [loadData]);

    useSocket(restaurantId, {
        'order:new':     handleRealTimeUpdate,
        'order:updated': handleRealTimeUpdate,
        'order:status':  handleRealTimeUpdate,
    });

    // Poll every 5 seconds for "live" feel as requested
    useEffect(() => {
        if (!restaurantId || !activeDates.startDate || !activeDates.endDate) return;
        
        const interval = setInterval(() => {
            const { startDate, endDate } = activeDatesRef.current;
            if (startDate && endDate) {
                loadData(startDate, endDate);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [restaurantId, loadData, activeDates.startDate, activeDates.endDate]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData(activeDates.startDate, activeDates.endDate);
        setRefreshing(false);
    };

    const handleChipPress = (value: Timeframe) => {
        setSelectedTimeframe(value);
        if (value !== 'custom') {
            setAppliedStart('');
            setAppliedEnd('');
        }
    };

    const handleApplyCustom = () => {
        setAppliedStart(customStart);
        setAppliedEnd(customEnd);
    };

    // ── Chart Config ──────────────────────────────────────────────────────────
    const chartConfig = {
        backgroundColor: colors.surface,
        backgroundGradientFrom: colors.surface,
        backgroundGradientTo: colors.surface,
        decimalPlaces: 0,
        color: (opacity = 1) => isDark ? `rgba(168, 85, 247, ${opacity})` : colors.accent,
        labelColor: (opacity = 1) => colors.textDim,
        style: { borderRadius: 16 },
        propsForDots: { r: '4', strokeWidth: '2', stroke: colors.accent },
    };

    // ── Chart Data ────────────────────────────────────────────────────────────
    const sortedTrends = revenueData
        ? [...revenueData.trends].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        : [];

    const lineChartData = {
        labels: sortedTrends.length > 0 ? sortedTrends.map(t => new Date(t.date).getDate().toString()) : ['No Data'],
        datasets: [{ data: sortedTrends.length > 0 ? sortedTrends.map(t => t.revenue) : [0] }],
    };

    const peakHoursFiltered = revenueData?.peakHours.filter(h => h.count > 0) ?? [];
    const peakHoursData = {
        labels: peakHoursFiltered.length > 0 ? peakHoursFiltered.map(h => `${h.hour}:00`) : ['N/A'],
        datasets: [{ data: peakHoursFiltered.length > 0 ? peakHoursFiltered.map(h => h.count) : [0] }],
    };

    const pieChartColors = ['#4ade80', '#60a5fa', '#f87171', '#c084fc', '#facc15'];
    const categoryPieData = (menuData?.categoryPerformance ?? []).slice(0, 5).map((cat, index) => ({
        name: cat.name,
        revenue: cat.revenue,
        color: pieChartColors[index % pieChartColors.length],
        legendFontColor: colors.text,
        legendFontSize: 12,
    }));

    const customerPieData = [
        { name: 'New',       count: customerData?.newCustomers ?? 0,       color: colors.green, legendFontColor: colors.text, legendFontSize: 12 },
        { name: 'Returning', count: customerData?.returningCustomers ?? 0, color: colors.blue,  legendFontColor: colors.text, legendFontSize: 12 },
    ];

    const subLabel = activeSubLabel;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <ScrollView
            style={[S.screen, { backgroundColor: colors.bg }]}
            contentContainerStyle={styles.body}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >
            {/* Title */}
            <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>

            {/* ── Timeframe Chip Bar ─────────────────────────────────────── */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
                style={styles.chipScroll}
            >
                {CHIPS.map(chip => {
                    const active = selectedTimeframe === chip.value;
                    return (
                        <TouchableOpacity
                            key={chip.value}
                            style={[
                                styles.chip,
                                { borderColor: colors.border, backgroundColor: active ? colors.accent : colors.surface },
                            ]}
                            onPress={() => handleChipPress(chip.value)}
                            activeOpacity={0.75}
                        >
                            <Text style={[styles.chipText, { color: active ? '#fff' : colors.textMuted }]}>
                                {chip.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* ── Custom Date Inputs ─────────────────────────────────────── */}
            {selectedTimeframe === 'custom' && (
                <View style={[styles.customRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.dateInputWrap}>
                        <Text style={[styles.dateLabel, { color: colors.textDim }]}>From</Text>
                        <TextInput
                            style={[styles.dateInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.bg }]}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={colors.textDim}
                            value={customStart}
                            onChangeText={setCustomStart}
                            keyboardType="numeric"
                            maxLength={10}
                        />
                    </View>
                    <Feather name="arrow-right" size={16} color={colors.textDim} style={styles.arrow} />
                    <View style={styles.dateInputWrap}>
                        <Text style={[styles.dateLabel, { color: colors.textDim }]}>To</Text>
                        <TextInput
                            style={[styles.dateInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.bg }]}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={colors.textDim}
                            value={customEnd}
                            onChangeText={setCustomEnd}
                            keyboardType="numeric"
                            maxLength={10}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.applyBtn, { backgroundColor: colors.accent }]}
                        onPress={handleApplyCustom}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.applyBtnText}>Apply</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={[styles.loadingText, { color: colors.textDim }]}>Loading analytics…</Text>
                </View>
            ) : !revenueData || !menuData || !customerData ? (
                <Text style={[styles.hint, { color: colors.textMuted, textAlign: 'center', marginTop: 32 }]}>
                    No data available for the selected period.
                </Text>
            ) : (
                <>
                    {/* Revenue KPIs */}
                    <View style={styles.grid}>
                        <KpiCard
                            icon={<Feather name="dollar-sign" size={24} color={colors.green} />}
                            value={`₹${revenueData.totalRevenue.toFixed(0)}`}
                            label="Total Revenue"
                            sub={subLabel}
                            accentColor={colors.green}
                        />
                        <KpiCard
                            icon={<Feather name="shopping-bag" size={24} color={colors.blue} />}
                            value={revenueData.orderVolume}
                            label="Orders"
                            sub="Volume"
                            accentColor={colors.blue}
                        />
                        <KpiCard
                            icon={<Feather name="activity" size={24} color={colors.purple} />}
                            value={`₹${revenueData.averageOrderValue.toFixed(0)}`}
                            label="AOV"
                            sub="Avg Order Value"
                            accentColor={colors.purple}
                        />
                    </View>

                    {/* Revenue Trends Chart */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Revenue Trends</Text>
                            <Text style={[styles.cardSub, { color: colors.textDim }]}>{subLabel}</Text>
                        </View>
                        <LineChart
                            data={lineChartData}
                            width={screenWidth - 64}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </View>

                    {/* Peak Hours */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Peak Hours</Text>
                            <Text style={[styles.cardSub, { color: colors.textDim }]}>Order Volume</Text>
                        </View>
                        <BarChart
                            data={peakHoursData}
                            width={screenWidth - 64}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={chartConfig}
                            verticalLabelRotation={30}
                            style={styles.chart}
                        />
                    </View>

                    {/* Top Selling Items */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Top Selling Items</Text>
                            <Text style={[styles.cardSub, { color: colors.textDim }]}>{subLabel}</Text>
                        </View>
                        {menuData.popularItems.slice(0, 5).map(item => (
                            <View key={item.id} style={[styles.listItem, { borderBottomColor: colors.border }]}>
                                <View>
                                    <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                                    <Text style={[styles.itemSub, { color: colors.textMuted }]}>{item.quantity} sold • ₹{item.revenue}</Text>
                                </View>
                                <View style={[styles.badge, getBadgeStyle(item.type)]}>
                                    <Text style={[styles.badgeText, { color: colors.text }]}>{item.type}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Category Revenue Breakdown */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Category Breakdown</Text>
                            <Text style={[styles.cardSub, { color: colors.textDim }]}>{subLabel}</Text>
                        </View>
                        {categoryPieData.length > 0 ? (
                            <PieChart
                                data={categoryPieData}
                                width={screenWidth - 64}
                                height={200}
                                chartConfig={chartConfig}
                                accessor="revenue"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                            />
                        ) : (
                            <Text style={[styles.hint, { color: colors.textMuted }]}>No category data available</Text>
                        )}
                    </View>

                    {/* Customer Insights */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Customer Insights</Text>
                            <Text style={[styles.cardSub, { color: colors.textDim }]}>{subLabel}</Text>
                        </View>
                        {customerData.newCustomers > 0 || customerData.returningCustomers > 0 ? (
                            <PieChart
                                data={customerPieData}
                                width={screenWidth - 64}
                                height={200}
                                chartConfig={chartConfig}
                                accessor="count"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                            />
                        ) : (
                            <Text style={[styles.hint, { color: colors.textMuted }]}>No customer data available</Text>
                        )}

                        <Text style={[styles.cardTitle, { color: colors.text, marginTop: 16 }]}>Top Spenders</Text>
                        {customerData.topSpenders.length > 0
                            ? customerData.topSpenders.map((cust, idx) => (
                                <View key={cust.id} style={[styles.listItem, { borderBottomColor: colors.border }]}>
                                    <View>
                                        <Text style={[styles.itemName, { color: colors.text }]}>{idx + 1}. {cust.name}</Text>
                                        <Text style={[styles.itemSub, { color: colors.textMuted }]}>{cust.orderCount} orders</Text>
                                    </View>
                                    <Text style={[styles.itemRevenue, { color: colors.green }]}>₹{cust.totalSpent.toFixed(0)}</Text>
                                </View>
                            ))
                            : <Text style={[styles.hint, { color: colors.textMuted }]}>No top spenders data yet.</Text>
                        }
                    </View>
                </>
            )}
        </ScrollView>
    );
}

const getBadgeStyle = (type: string) => {
    switch (type) {
        case 'Star':      return { backgroundColor: 'rgba(74, 222, 128, 0.2)' };
        case 'Plowhorse': return { backgroundColor: 'rgba(96, 165, 250, 0.2)' };
        case 'Puzzle':    return { backgroundColor: 'rgba(192, 132, 252, 0.2)' };
        case 'Dog':       return { backgroundColor: 'rgba(248, 113, 113, 0.2)' };
        default:          return { backgroundColor: 'rgba(100,100,100,0.15)' };
    }
};

const styles = StyleSheet.create({
    body: { padding: 16, paddingBottom: 40, paddingTop: 60 },
    title: { fontSize: 26, fontWeight: '800', marginBottom: 16 },

    // Chip bar
    chipScroll: { marginBottom: 12 },
    chipRow: { flexDirection: 'row', gap: 8, paddingRight: 16 },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 99,
        borderWidth: 1,
    },
    chipText: { fontSize: 13, fontWeight: '600' },

    // Custom date row
    customRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        borderWidth: 1,
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
    },
    dateInputWrap: { flex: 1 },
    dateLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
    dateInput: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 13,
    },
    arrow: { marginBottom: 10 },
    applyBtn: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 0,
    },
    applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

    // Loading
    loadingWrap: { alignItems: 'center', marginTop: 48, gap: 12 },
    loadingText: { fontSize: 14 },

    // KPI grid
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },

    // Cards
    card: {
        ...S.shadow,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700' },
    cardSub: { fontSize: 12, fontWeight: '500' },

    // Chart
    chart: { marginVertical: 8, borderRadius: 16 },

    // List items
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    itemName: { fontSize: 15, fontWeight: '600' },
    itemSub: { fontSize: 13, marginTop: 4 },
    itemRevenue: { fontSize: 15, fontWeight: '700' },

    // Badge
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 12, fontWeight: '700' },

    hint: { fontStyle: 'italic', textAlign: 'center', marginVertical: 8 },
});
