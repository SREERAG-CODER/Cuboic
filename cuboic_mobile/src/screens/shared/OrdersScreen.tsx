import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    RefreshControl, ActivityIndicator, Alert, ScrollView, Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ordersApi, type Order } from '../../api/orders';
import { tablesApi, type RestaurantTable } from '../../api/tables';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { StatusBadge } from '../../components/StatusBadge';
import { COLORS, S, statusColor } from '../../theme';

const ALL_STATUSES = ['All', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Assigned', 'Delivered', 'Cancelled'];

const ACTIVE_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Assigned'];

const NEXT_STATUS: Record<string, string> = {
    Pending: 'Confirmed',
    Confirmed: 'Preparing',
    Preparing: 'Ready',
};

// ─── helpers ────────────────────────────────────────────────────────────────

function getTableNum(order: Order): string {
    let num = '';
    if (order.table?.table_number !== undefined) {
        num = String(order.table.table_number);
    } else {
        // fallback: should rarely happen
        num = order.tableId.slice(-4);
    }
    return num.startsWith('T') ? num.substring(1) : num;
}

interface TableSummary {
    tableNum: string;
    orders: Order[];
    activeOrders: Order[];
    dominantStatus: string | null;
}

function buildTableSummaries(orders: Order[], allTables: RestaurantTable[]): TableSummary[] {
    const map = new Map<string, Order[]>();
    
    // Seed the map with all tables so idle ones show up
    for (const t of allTables) {
        const num = String(t.table_number);
        map.set(num.startsWith('T') ? num.substring(1) : num, []);
    }

    // Add orders to their respective tables
    for (const o of orders) {
        const key = getTableNum(o);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(o);
    }

    const summaries: TableSummary[] = [];
    map.forEach((tableOrders, tableNum) => {
        const activeOrders = tableOrders.filter(o => ACTIVE_STATUSES.includes(o.status));
        // Pick the "loudest" active status for colour
        const statusPriority = ['Pending', 'Preparing', 'Confirmed', 'Ready', 'Assigned'];
        let dominantStatus: string | null = null;
        for (const s of statusPriority) {
            if (activeOrders.some(o => o.status === s)) { dominantStatus = s; break; }
        }
        summaries.push({ tableNum, orders: tableOrders, activeOrders, dominantStatus });
    });

    // sort by table number numerically
    summaries.sort((a, b) => {
        const na = parseInt(a.tableNum, 10);
        const nb = parseInt(b.tableNum, 10);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.tableNum.localeCompare(b.tableNum);
    });

    return summaries;
}

// ─── sub-components ─────────────────────────────────────────────────────────

function TableCard({ summary, onPress }: { summary: TableSummary; onPress: () => void }) {
    const hasActive = summary.activeOrders.length > 0;
    const dotColor = hasActive
        ? statusColor(summary.dominantStatus ?? 'Pending')
        : COLORS.textDim;

    return (
        <TouchableOpacity
            style={[styles.tableCard, hasActive && styles.tableCardActive]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <View style={[styles.tableDot, { backgroundColor: dotColor }]} />
            <Text style={styles.tableNum}>T{summary.tableNum}</Text>
            {hasActive ? (
                <Text style={[styles.tableOrderCount, { color: dotColor }]}>
                    {summary.activeOrders.length} order{summary.activeOrders.length !== 1 ? 's' : ''}
                </Text>
            ) : (
                <Text style={styles.tableIdle}>Idle</Text>
            )}
        </TouchableOpacity>
    );
}

function OrderCard({
    item,
    onAdvance,
    onCancel,
}: {
    item: Order;
    onAdvance: (o: Order) => void;
    onCancel: (o: Order) => void;
}) {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Order #{item.id.slice(-5).toUpperCase()}</Text>
                    <Text style={styles.cardTime}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
                </View>
                <StatusBadge status={item.status} />
            </View>

            {/* Items */}
            <View style={styles.itemsRow}>
                {item.items.map((it, i) => (
                    <View key={i} style={styles.chip}>
                        <Text style={styles.chipText}>{it.name} ×{it.quantity}</Text>
                    </View>
                ))}
            </View>

            {/* Notes */}
            {item.notes && (
                <View style={styles.notesBox}>
                    <Feather name="file-text" size={13} color="#ef4444" />
                    <Text style={styles.notesText}>{item.notes}</Text>
                </View>
            )}

            {/* Total + Actions */}
            <View style={styles.cardFooter}>
                <Text style={styles.total}>₹{item.total.toFixed(2)}</Text>
                <View style={styles.actions}>
                    {NEXT_STATUS[item.status] && (
                        <TouchableOpacity
                            style={styles.btnAdvance}
                            onPress={() => onAdvance(item)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.btnAdvanceText}>→ {NEXT_STATUS[item.status]}</Text>
                        </TouchableOpacity>
                    )}
                    {!['Delivered', 'Cancelled', 'Assigned'].includes(item.status) && (
                        <TouchableOpacity
                            style={styles.btnCancel}
                            onPress={() => onCancel(item)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.btnCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

// ─── main screen ────────────────────────────────────────────────────────────

export function OrdersScreen() {
    const { user } = useAuth();
    const restaurantId = user?.restaurantId ?? '';

    const [orders, setOrders] = useState<Order[]>([]);
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // table-view state
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState('All');

    const load = useCallback(async () => {
        if (!restaurantId) return;
        try {
            // fetch tables and all orders in parallel
            const [ordersData, tablesData] = await Promise.all([
                ordersApi.findAll(restaurantId),
                tablesApi.findAll(restaurantId)
            ]);
            setOrders(ordersData);
            setTables(tablesData);
        } catch { /* ignore */ }
    }, [restaurantId]);

    useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

    useSocket(restaurantId, {
        'order:new': () => load(),
        'order:updated': () => load(),
    });

    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const handleAdvance = async (order: Order) => {
        const next = NEXT_STATUS[order.status];
        if (!next) return;
        try {
            await ordersApi.updateStatus(order.id, next);
            load();
        } catch { Alert.alert('Error', 'Failed to update order'); }
    };

    const handleCancel = (order: Order) => {
        Alert.alert('Cancel Order', 'Are you sure?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
                    try {
                        await ordersApi.updateStatus(order.id, 'Cancelled');
                        load();
                    } catch { Alert.alert('Error', 'Failed to cancel order'); }
                }
            },
        ]);
    };

    if (loading) return (
        <View style={S.screen}>
            <ActivityIndicator style={{ marginTop: 80 }} color={COLORS.accent} size="large" />
        </View>
    );

    const tableSummaries = buildTableSummaries(orders, tables);

    // ── Table detail view ──────────────────────────────────────────────────
    if (selectedTable !== null) {
        const summary = tableSummaries.find(t => t.tableNum === selectedTable);
        const tableOrders = summary?.orders ?? [];
        const filtered = filterStatus === 'All'
            ? tableOrders
            : tableOrders.filter(o => o.status === filterStatus);

        return (
            <View style={S.screen}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.backBtn} onPress={() => { setSelectedTable(null); setFilterStatus('All'); }}>
                        <Feather name="arrow-left" size={20} color={COLORS.accent} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>T{selectedTable}</Text>
                        <Text style={styles.sub}>{tableOrders.length} order{tableOrders.length !== 1 ? 's' : ''} total</Text>
                    </View>
                </View>

                {/* Status Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabsContainer}
                    contentContainerStyle={styles.tabsContent}
                >
                    {ALL_STATUSES.map(s => (
                        <TouchableOpacity
                            key={s}
                            style={[styles.tab, filterStatus === s && styles.tabActive]}
                            onPress={() => setFilterStatus(s)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabText, filterStatus === s && styles.tabTextActive]}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
                    renderItem={({ item }) => (
                        <OrderCard item={item} onAdvance={handleAdvance} onCancel={handleCancel} />
                    )}
                    ListEmptyComponent={
                        <Text style={styles.empty}>No orders for "{filterStatus}"</Text>
                    }
                />
            </View>
        );
    }

    // ── Table grid view ────────────────────────────────────────────────────
    const activeTableCount = tableSummaries.filter(t => t.activeOrders.length > 0).length;

    return (
        <View style={S.screen}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Orders</Text>
                <Text style={styles.sub}>
                    {activeTableCount} active table{activeTableCount !== 1 ? 's' : ''} · {tableSummaries.length} total
                </Text>
            </View>

            {tableSummaries.length === 0 ? (
                <Text style={styles.empty}>No tables configured</Text>
            ) : (
                <FlatList
                    data={tableSummaries}
                    keyExtractor={item => item.tableNum}
                    numColumns={2}
                    contentContainerStyle={styles.gridList}
                    columnWrapperStyle={styles.gridRow}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
                    renderItem={({ item }) => (
                        <TableCard summary={item} onPress={() => setSelectedTable(item.tableNum)} />
                    )}
                />
            )}
        </View>
    );
}

// ─── styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    header: {
        padding: 16,
        paddingTop: 42,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.surface2,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
    sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },

    // grid
    gridList: { padding: 16, paddingBottom: 32 },
    gridRow: { gap: 12, marginBottom: 12 },
    tableCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        alignItems: 'center',
        gap: 6,
        minHeight: 110,
        justifyContent: 'center',
    },
    tableCardActive: {
        borderColor: COLORS.accent + '55',
        backgroundColor: COLORS.surface2,
    },
    tableDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginBottom: 2,
    },
    tableNum: { fontSize: 22, fontWeight: '800', color: COLORS.text },
    tableOrderCount: { fontSize: 12, fontWeight: '600' },
    tableIdle: { fontSize: 12, color: COLORS.textDim, fontWeight: '500' },

    // filter tabs
    tabsContainer: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    tabsContent: { paddingHorizontal: 10, paddingVertical: 20, flexDirection: 'row', alignItems: 'center' },
    tab: {
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 99,
        backgroundColor: COLORS.surface2,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 8,
        flexShrink: 0,
        height: 40, justifyContent: 'center',
    },
    tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    tabText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
    tabTextActive: { color: '#0f0f13' },

    // order cards
    list: { padding: 16, gap: 12, paddingBottom: 32 },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 14,
        gap: 10,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    cardTime: { fontSize: 12, color: COLORS.textDim, marginTop: 2 },
    itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
        backgroundColor: COLORS.surface2,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    chipText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
    notesBox: {
        backgroundColor: '#ff6b6b18',
        borderRadius: 8,
        padding: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#ef4444',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    notesText: { fontSize: 13, color: '#ef4444', flex: 1 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    total: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    actions: { flexDirection: 'row', gap: 8 },
    btnAdvance: {
        backgroundColor: COLORS.accent,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
    },
    btnAdvanceText: { color: '#0f0f13', fontWeight: '700', fontSize: 13 },
    btnCancel: {
        backgroundColor: '#ef444422',
        borderWidth: 1,
        borderColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
    },
    btnCancelText: { color: '#ef4444', fontWeight: '700', fontSize: 13 },
    empty: { textAlign: 'center', color: COLORS.textMuted, marginTop: 60, fontSize: 14 },
});
