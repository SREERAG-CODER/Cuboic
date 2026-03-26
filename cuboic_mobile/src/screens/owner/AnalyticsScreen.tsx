import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi, RevenueTrends, MenuAnalytics, CustomerInsights } from '../../api/analytics';
import { COLORS } from '../../theme';
import { KpiCard } from '../../components/KpiCard';
import { Feather } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export function AnalyticsScreen() {
    const { user } = useAuth();
    const restaurantId = user?.restaurantId ?? '';

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [revenueData, setRevenueData] = useState<RevenueTrends | null>(null);
    const [menuData, setMenuData] = useState<MenuAnalytics | null>(null);
    const [customerData, setCustomerData] = useState<CustomerInsights | null>(null);

    const loadData = useCallback(async () => {
        if (!restaurantId) return;

        try {
            const [rev, menu, cust] = await Promise.all([
                analyticsApi.getRevenueTrends(restaurantId),
                analyticsApi.getMenuAnalytics(restaurantId),
                analyticsApi.getCustomerInsights(restaurantId),
            ]);

            setRevenueData(rev);
            setMenuData(menu);
            setCustomerData(cust);
        } catch (error) {
            console.error('Failed to load analytics', error);
        }
    }, [restaurantId]);

    useEffect(() => {
        loadData().finally(() => setLoading(false));
    }, [loadData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    if (loading || !revenueData || !menuData || !customerData) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
        );
    }

    // Prepare chart data
    const sortedTrends = [...revenueData.trends].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const lineChartData = {
        labels: sortedTrends.length > 0 ? sortedTrends.map(t => new Date(t.date).getDate().toString()) : ['No Data'],
        datasets: [
            {
                data: sortedTrends.length > 0 ? sortedTrends.map(t => t.revenue) : [0],
            }
        ]
    };

    const peakHoursData = {
        labels: revenueData.peakHours.filter(h => h.count > 0).map(h => `${h.hour}:00`),
        datasets: [
            {
                data: revenueData.peakHours.filter(h => h.count > 0).map(h => h.count),
            }
        ]
    };
    if (peakHoursData.labels.length === 0) {
        peakHoursData.labels.push('N/A');
        peakHoursData.datasets[0].data.push(0);
    }

    const pieChartColors = ['#4ade80', '#60a5fa', '#f87171', '#c084fc', '#facc15'];
    const categoryPieData = menuData.categoryPerformance.slice(0, 5).map((cat, index) => ({
        name: cat.name,
        revenue: cat.revenue,
        color: pieChartColors[index % pieChartColors.length],
        legendFontColor: COLORS.text,
        legendFontSize: 12,
    }));

    const customerPieData = [
        { name: 'New', count: customerData.newCustomers, color: COLORS.green, legendFontColor: COLORS.text, legendFontSize: 12 },
        { name: 'Returning', count: customerData.returningCustomers, color: COLORS.blue, legendFontColor: COLORS.text, legendFontSize: 12 }
    ];

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.body}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        >
            <Text style={styles.title}>Analytics Dashboard</Text>

            {/* Revenue Overview KPIs */}
            <View style={styles.grid}>
                <KpiCard
                    icon={<Feather name="dollar-sign" size={24} color={COLORS.green} />}
                    value={`₹${revenueData.totalRevenue.toFixed(0)}`}
                    label="Total Revenue"
                    sub="Last 30 Days"
                    accentColor={COLORS.green}
                />
                <KpiCard
                    icon={<Feather name="shopping-bag" size={24} color={COLORS.blue} />}
                    value={revenueData.orderVolume}
                    label="Orders"
                    sub="Volume"
                    accentColor={COLORS.blue}
                />
                <KpiCard
                    icon={<Feather name="activity" size={24} color={COLORS.purple} />}
                    value={`₹${revenueData.averageOrderValue.toFixed(0)}`}
                    label="AOV"
                    sub="Average Order Value"
                    accentColor={COLORS.purple}
                />
            </View>

            {/* Revenue Trends */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Revenue Trends</Text>
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
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Peak Hours Order Volume</Text>
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

            {/* Menu Analytics */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Top Selling Items</Text>
                {menuData.popularItems.slice(0, 5).map(item => (
                    <View key={item.id} style={styles.listItem}>
                        <View>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemSub}>{item.quantity} sold • ₹{item.revenue}</Text>
                        </View>
                        <View style={[styles.badge, getBadgeStyle(item.type)]}>
                            <Text style={styles.badgeText}>{item.type}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Category Revenue Breakdown</Text>
                {categoryPieData.length > 0 ? (
                    <PieChart
                        data={categoryPieData}
                        width={screenWidth - 64}
                        height={200}
                        chartConfig={chartConfig}
                        accessor={"revenue"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                ) : (
                    <Text style={styles.hint}>No category data available</Text>
                )}
            </View>

            {/* Customer Insights */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Customer Insights</Text>
                {customerData.newCustomers > 0 || customerData.returningCustomers > 0 ? (
                    <PieChart
                        data={customerPieData}
                        width={screenWidth - 64}
                        height={200}
                        chartConfig={chartConfig}
                        accessor={"count"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                ) : (
                    <Text style={styles.hint}>No customer data available</Text>
                )}

                <Text style={[styles.cardTitle, { marginTop: 16 }]}>Top Spenders</Text>
                {customerData.topSpenders.length > 0 ? customerData.topSpenders.map((cust, idx) => (
                    <View key={cust.id} style={styles.listItem}>
                        <View>
                            <Text style={styles.itemName}>{idx + 1}. {cust.name}</Text>
                            <Text style={styles.itemSub}>{cust.orderCount} orders</Text>
                        </View>
                        <Text style={styles.itemRevenue}>₹{cust.totalSpent.toFixed(0)}</Text>
                    </View>
                )) : <Text style={styles.hint}>No top spenders data yet.</Text>}
            </View>

        </ScrollView>
    );
}

const chartConfig = {
    backgroundColor: COLORS.surface,
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: COLORS.accent }
};

const getBadgeStyle = (type: string) => {
    switch (type) {
        case 'Star': return { backgroundColor: 'rgba(74, 222, 128, 0.2)' };
        case 'Plowhorse': return { backgroundColor: 'rgba(96, 165, 250, 0.2)' };
        case 'Puzzle': return { backgroundColor: 'rgba(192, 132, 252, 0.2)' };
        case 'Dog': return { backgroundColor: 'rgba(248, 113, 113, 0.2)' };
        default: return { backgroundColor: COLORS.border };
    }
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.bg },
    body: { padding: 16, paddingBottom: 40, paddingTop: 60 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
    title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 24 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
    chart: { marginVertical: 8, borderRadius: 16 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    itemName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    itemSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
    itemRevenue: { fontSize: 15, fontWeight: '700', color: COLORS.green },
    hint: { color: COLORS.textMuted, fontStyle: 'italic', textAlign: 'center', marginVertical: 8 },
});
