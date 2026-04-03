import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    RefreshControl, ActivityIndicator, Alert, ScrollView, Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ordersApi, type Order } from '../../api/orders';
import { tablesApi, type RestaurantTable } from '../../api/tables';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../hooks/useSocket';
import { StatusBadge } from '../../components/StatusBadge';
import { FONT, S, getStatusColor } from '../../theme';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

const ALL_STATUSES = ['All', 'Pending', 'Confirmed', 'Ready', 'Delivered', 'Cancelled']; 

const ACTIVE_STATUSES = ['Pending', 'Confirmed', 'Ready']; 
const NEXT_STATUS: Record<string, string> = {
    Pending: 'Confirmed',
    Confirmed: 'Ready', 
    Ready: 'Delivered',
};

// ─── helpers ────────────────────────────────────────────────────────────────

function getTableNum(order: Order): string {
    if (order.table?.table_number !== undefined) {
        const str = String(order.table.table_number);
        if (str.toLowerCase() === 'takeaway') return 'Takeaway';
        return str.startsWith('T') ? str.substring(1) : str;
    }
    
    if (typeof order.tableId === 'string') {
        const idLower = order.tableId.toLowerCase();
        if (idLower === 'takeaway' || idLower === 'takeaway_virtual') return 'Takeaway';
        const str = order.tableId.slice(-4);
        return str.startsWith('T') ? str.substring(1) : str;
    }
    
    return 'TAKE';
}

interface TableSummary {
    tableNum: string;
    orders: Order[];
    activeOrders: Order[];
    dominantStatus: string | null;
}

function buildTableSummaries(orders: Order[], allTables: RestaurantTable[]): TableSummary[] {
    const map = new Map<string, Order[]>();

    for (const t of allTables) {
        const num = String(t.table_number);
        map.set(num.startsWith('T') ? num.substring(1) : num, []);
    }

    for (const o of orders) {
        const key = getTableNum(o);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(o);
    }

    const summaries: TableSummary[] = [];
    map.forEach((tableOrders, tableNum) => {
        const activeOrders = tableOrders.filter(o => ACTIVE_STATUSES.includes(o.status));
        const statusPriority = ['Pending', 'Preparing', 'Confirmed', 'Ready', 'Assigned'];
        let dominantStatus: string | null = null;
        for (const s of statusPriority) {
            if (activeOrders.some(o => o.status === s)) { dominantStatus = s; break; }
        }
        summaries.push({ tableNum, orders: tableOrders, activeOrders, dominantStatus });
    });

    summaries.sort((a, b) => {
        if (a.tableNum.toLowerCase() === 'takeaway') return -1;
        if (b.tableNum.toLowerCase() === 'takeaway') return 1;
        const na = parseInt(a.tableNum, 10);
        const nb = parseInt(b.tableNum, 10);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.tableNum.localeCompare(b.tableNum);
    });

    return summaries;
}

// ─── sub-components ─────────────────────────────────────────────────────────

function TableCard({ summary, onPress }: { summary: TableSummary; onPress: () => void }) {
    const { colors } = useTheme();
    const hasActive = summary.activeOrders.length > 0;
    const dotColor = hasActive
        ? getStatusColor(summary.dominantStatus ?? 'Pending', colors)
        : colors.textDim;

    return (
        <TouchableOpacity
            style={[
                styles.tableCard, 
                { backgroundColor: colors.surface, borderColor: colors.border },
                hasActive && { borderColor: colors.accent + '55', backgroundColor: colors.surface2 }
            ]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <View style={[styles.tableDot, { backgroundColor: dotColor }]} />
            <Text style={[styles.tableNum, { color: colors.text }, summary.tableNum.toLowerCase() === 'takeaway' && { fontSize: 18 }]}>
                {summary.tableNum.toLowerCase() === 'takeaway' ? 'Takeaway' : `T${summary.tableNum}`}
            </Text>
            {hasActive ? (
                <Text style={[styles.tableOrderCount, { color: dotColor }]}>
                    {summary.activeOrders.length} order{summary.activeOrders.length !== 1 ? 's' : ''}
                </Text>
            ) : (
                <Text style={[styles.tableIdle, { color: colors.textDim }]}>Idle</Text>
            )}
        </TouchableOpacity>
    );
}

function OrderCard({
    item,
    onAdvance,
    onCancel,
    onMarkPaid,
}: {
    item: Order;
    onAdvance: (o: Order) => void;
    onCancel: (o: Order) => void;
    onMarkPaid: (o: Order) => void;
}) {
    const { colors } = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Order #{item.id.slice(-5).toUpperCase()}</Text>
                        
                        {(item.table?.table_number?.toLowerCase() === 'takeaway' || item.tableId?.toLowerCase() === 'takeaway' || item.tableId?.toLowerCase() === 'takeaway_virtual') && (
                            <View style={{ backgroundColor: colors.purple + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: colors.purple + '55' }}>
                                <Text style={{ fontSize: 10, color: colors.purple, fontWeight: 'bold' }}>TAKEAWAY</Text>
                            </View>
                        )}

                        {item.payment?.status === 'Pending' && (
                            <View style={{ backgroundColor: colors.amber + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ fontSize: 10, color: colors.amber, fontWeight: 'bold' }}>UNPAID</Text>
                            </View>
                        )}
                        {item.payment?.status === 'Paid' && (
                            <View style={{ backgroundColor: colors.green + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ fontSize: 10, color: colors.green, fontWeight: 'bold' }}>PAID</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.cardTime, { color: colors.textDim }]}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
                    
                    {item.customer && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <Feather name="user" size={12} color={colors.textMuted} />
                            <Text style={{ fontSize: 12, color: colors.textMuted }}>
                                {item.customer.name} • {item.customer.phone}
                            </Text>
                        </View>
                    )}
                </View>
                <StatusBadge status={item.status} />
            </View>

            {/* Items */}
            <View style={styles.itemsRow}>
                {item.items.map((it, i) => (
                    <View key={i} style={[styles.chip, { backgroundColor: colors.surface2 }]}>
                        <Text style={[styles.chipText, { color: colors.textMuted }]}>{it.name} ×{it.quantity}</Text>
                    </View>
                ))}
            </View>

            {/* Notes */}
            {item.notes && (
                <View style={[styles.notesBox, { backgroundColor: colors.red + '10' }]}>
                    <Feather name="file-text" size={13} color={colors.red} />
                    <Text style={[styles.notesText, { color: colors.red }]}>{item.notes}</Text>
                </View>
            )}

            {/* Total + Actions */}
            <View style={styles.cardFooter}>
                <Text style={[styles.total, { color: colors.text }]}>₹{item.total.toFixed(2)}</Text>
                <View style={styles.actions}>
                    {item.payment?.status === 'Pending' && (
                        <TouchableOpacity
                            style={[styles.btnAdvance, { backgroundColor: colors.green }]}
                            onPress={() => onMarkPaid(item)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.btnAdvanceText, { color: 'white' }]}>Paid</Text>
                        </TouchableOpacity>
                    )}
                    {NEXT_STATUS[item.status] && (
                        <TouchableOpacity
                            style={[styles.btnAdvance, { backgroundColor: colors.accent }]}
                            onPress={() => onAdvance(item)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.btnAdvanceText, { color: '#0f0f13' }]}>{NEXT_STATUS[item.status]}</Text>
                        </TouchableOpacity>
                    )}
                    {!['Delivered', 'Cancelled', 'Assigned'].includes(item.status) && (
                        <TouchableOpacity
                            style={[styles.btnCancel, { paddingHorizontal: 10, justifyContent: 'center', backgroundColor: colors.red + '15', borderColor: colors.red }]}
                            onPress={() => onCancel(item)}
                            activeOpacity={0.8}
                        >
                            <Feather name="x" size={16} color={colors.red} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

// ─── main screen ────────────────────────────────────────────────────────────

export function OrdersScreen({ route }: any) {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const restaurantId = user?.restaurantId ?? '';
    const statusInitial = route?.params?.statusInitial;

    const [orders, setOrders] = useState<Order[]>([]);
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [preferredVoice, setPreferredVoice] = useState<string | undefined>(undefined);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const initVoices = async () => {
            try {
                const voices = await Speech.getAvailableVoicesAsync();
                const inVoice = voices.find(v => {
                    const lang = v.language.replace('_', '-').toLowerCase();
                    return lang.startsWith('en-in');
                })?.identifier;
                const enVoice = voices.find(v => v.language.toLowerCase().startsWith('en-'))?.identifier;
                setPreferredVoice(inVoice || enVoice);
            } catch (err) {
                console.error('[DEBUG] Error fetching voices:', err);
            }
        };
        initVoices();
    }, []);

    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState(statusInitial || 'All');

    useEffect(() => {
        if (statusInitial) {
            setFilterStatus(statusInitial);
        }
    }, [statusInitial]);

    const load = useCallback(async () => {
        if (!restaurantId) return;
        try {
            const [ordersData, tablesData] = await Promise.all([
                ordersApi.findAll(restaurantId),
                tablesApi.findAll(restaurantId)
            ]);
            setOrders(ordersData);
            setTables(tablesData);
        } catch { /* ignore */ }
    }, [restaurantId]);

    useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

    const isMountedRef = useRef(true);
    const pendingOrdersRef = useRef<Order[]>([]);
    const isSpeakingRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            Speech.stop();
        };
    }, []);

    useEffect(() => {
        pendingOrdersRef.current = orders.filter(o => o.status === 'Pending');
        if (pendingOrdersRef.current.length === 0 && isSpeakingRef.current) {
            Speech.stop();
            isSpeakingRef.current = false;
        }
    }, [orders]);

    const announcementLoop = useCallback(() => {
        if (!isMountedRef.current || isMuted) {
            isSpeakingRef.current = false;
            Speech.stop();
            return;
        }
        const pending = pendingOrdersRef.current;
        if (pending.length === 0) {
            isSpeakingRef.current = false;
            return;
        }
        isSpeakingRef.current = true;
        const messages = pending.map((o: Order) => {
            const tableNum = getTableNum(o);
            const itemsList = o.items.map((it: any) => `${it.quantity} ${it.name}`).join(', ');
            return `New order for Table ${tableNum}. Items: ${itemsList}.`;
        });
        const fullMessage = messages.join(' ... ');
        Speech.speak(fullMessage, {
            language: 'en-IN',
            voice: preferredVoice,
            rate: 0.85,
            pitch: 1.0,
            onDone: () => {
                setTimeout(() => {
                    if (isMountedRef.current && isSpeakingRef.current && pendingOrdersRef.current.length > 0) {
                        announcementLoop();
                    } else {
                        isSpeakingRef.current = false;
                    }
                }, 4000); 
            },
            onStopped: () => { isSpeakingRef.current = false; },
            onError: (err) => {
                console.error('[DEBUG] Speech error:', err);
                isSpeakingRef.current = false;
            }
        });
    }, [preferredVoice, isMuted]);

    useEffect(() => {
        if (pendingOrdersRef.current.length > 0 && !isSpeakingRef.current && !isMuted) {
            announcementLoop();
        }
        if (isMuted) {
            Speech.stop();
            isSpeakingRef.current = false;
        }
    }, [orders, announcementLoop, isMuted]);

    useEffect(() => {
        const interval = setInterval(load, 2000);
        return () => clearInterval(interval);
    }, [load]);

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

    const handleMarkPaid = async (order: Order) => {
        try {
            await ordersApi.markAsPaid(order.id);
            load();
        } catch { Alert.alert('Error', 'Failed to mark order as paid'); }
    };

    if (loading) return (
        <View style={[S.screen, { backgroundColor: colors.bg }]}>
            <ActivityIndicator style={{ marginTop: 80 }} color={colors.accent} size="large" />
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
            <View style={[S.screen, { backgroundColor: colors.bg }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                    <Pressable style={[styles.backBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]} onPress={() => { setSelectedTable(null); setFilterStatus('All'); }}>
                        <Feather name="arrow-left" size={20} color={colors.accent} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {selectedTable?.toLowerCase() === 'takeaway' ? 'Takeaway' : `T${selectedTable}`}
                        </Text>
                        <Text style={[styles.sub, { color: colors.textMuted }]}>{tableOrders.length} order{tableOrders.length !== 1 ? 's' : ''} total</Text>
                    </View>
                </View>

                {/* Status Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={[styles.tabsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
                    contentContainerStyle={styles.tabsContent}
                >
                    {ALL_STATUSES.map(s => (
                        <TouchableOpacity
                            key={s}
                            style={[
                                styles.tab, 
                                { backgroundColor: colors.surface2, borderColor: colors.border },
                                filterStatus === s && { backgroundColor: colors.accent, borderColor: colors.accent }
                            ]}
                            onPress={() => setFilterStatus(s)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabText, { color: colors.textMuted }, filterStatus === s && { color: '#0f0f13' }]}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
                    renderItem={({ item }) => (
                        <OrderCard item={item} onAdvance={handleAdvance} onCancel={handleCancel} onMarkPaid={handleMarkPaid} />
                    )}
                    ListEmptyComponent={
                        <Text style={[styles.empty, { color: colors.textMuted }]}>No orders for "{filterStatus}"</Text>
                    }
                />
            </View>
        );
    }

    // ── Table grid view ────────────────────────────────────────────────────
    const activeTableCount = tableSummaries.filter(t => t.activeOrders.length > 0).length;

    return (
        <View style={[S.screen, { backgroundColor: colors.bg }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Orders</Text>
                    <Text style={[styles.sub, { color: colors.textMuted }]}>
                        {activeTableCount} active table{activeTableCount !== 1 ? 's' : ''} · {tableSummaries.length} total
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => setIsMuted(prev => !prev)}
                    style={{ padding: 8, backgroundColor: isMuted ? colors.red + '22' : colors.surface2, borderRadius: 8, borderWidth: 1, borderColor: isMuted ? colors.red + '55' : 'transparent' }}
                >
                    <Feather name={isMuted ? "volume-x" : "volume-2"} size={20} color={isMuted ? colors.red : colors.accent} />
                </TouchableOpacity>
            </View>

            {tableSummaries.length === 0 ? (
                <Text style={[styles.empty, { color: colors.textMuted }]}>No tables configured</Text>
            ) : (
                <FlatList
                    data={tableSummaries}
                    keyExtractor={item => item.tableNum}
                    numColumns={2}
                    contentContainerStyle={styles.gridList}
                    columnWrapperStyle={styles.gridRow}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
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
        paddingTop: 48,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { fontSize: 24, fontWeight: '800' },
    sub: { fontSize: 13, marginTop: 2 },

    // grid
    gridList: { padding: 16, paddingBottom: 32 },
    gridRow: { gap: 12, marginBottom: 12 },
    tableCard: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        alignItems: 'center',
        gap: 6,
        minHeight: 110,
        justifyContent: 'center',
    },
    tableDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginBottom: 2,
    },
    tableNum: { fontSize: 22, fontWeight: '800' },
    tableOrderCount: { fontSize: 12, fontWeight: '600' },
    tableIdle: { fontSize: 12, fontWeight: '500' },

    // filter tabs
    tabsContainer: { borderBottomWidth: 1, maxHeight: 80 },
    tabsContent: { paddingHorizontal: 10, paddingVertical: 20, flexDirection: 'row', alignItems: 'center' },
    tab: {
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 99,
        borderWidth: 1,
        marginRight: 8,
        flexShrink: 0,
        height: 40, justifyContent: 'center',
    },
    tabText: { fontSize: 13, fontWeight: '600' },

    // order cards
    list: { padding: 16, gap: 12, paddingBottom: 32 },
    card: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        gap: 10,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
    cardTitle: { fontSize: 16, fontWeight: '700' },
    cardTime: { fontSize: 12, marginTop: 2 },
    itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    chipText: { fontSize: 12, fontWeight: '500' },
    notesBox: {
        borderRadius: 8,
        padding: 8,
        borderLeftWidth: 3,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    notesText: { fontSize: 13, flex: 1 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
    total: { fontSize: 16, fontWeight: '700' },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', flex: 1 },
    btnAdvance: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
    },
    btnAdvanceText: { fontWeight: '700', fontSize: 13 },
    btnCancel: {
        borderWidth: 1,
        paddingVertical: 7,
        borderRadius: 8,
    },
    empty: { textAlign: 'center', marginTop: 60, fontSize: 14 },
});
