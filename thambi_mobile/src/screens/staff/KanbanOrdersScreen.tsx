import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    RefreshControl, ActivityIndicator, Dimensions, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ordersApi, type Order } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../hooks/useSocket';
import * as Speech from 'expo-speech';
import { S, getStatusColor, FONT } from '../../theme';

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

const NEXT_STATUS: Record<string, string> = {
    Pending: 'Confirmed',
    Confirmed: 'Ready',
    Ready: 'Delivered',
};

// ─── Order Card Component ───────────────────────────────────────────────────

function KanbanCard({ item, onAdvance }: { item: Order, onAdvance: (o: Order) => void }) {
    const { colors } = useTheme();
    const indicatorColor = getStatusColor(item.status, colors);
    const tableNum = getTableNum(item);
    
    // Elapsed time calculation
    const elapsedMinutes = Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 60000);
    const timeDisplay = elapsedMinutes > 0 ? `${elapsedMinutes} Min` : 'Just now';

    // Format date "17 Nov, 01:30 PM"
    const dateObj = new Date(item.createdAt);
    const dateFormatted = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const timeFormatted = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const isTerminal = ['Delivered', 'Cancelled'].includes(item.status);
    
    const nextState = NEXT_STATUS[item.status];
    let btnColor = nextState ? getStatusColor(nextState, colors) : colors.border;
    
    // Override the grey color for "Mark Delivered" to make it highly visible
    if (nextState === 'Delivered') {
        btnColor = colors.purple;
    }

    return (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderTopWidth: 4, borderTopColor: indicatorColor }]}>
            {/* Header Area */}
            <View style={[styles.cardHeader, { backgroundColor: colors.surface2 }]}>
                <View style={styles.headerRow}>
                    <Text style={[styles.headerOrderId, { color: colors.text }]}>Order # {item.id.slice(-5).toUpperCase()}</Text>
                    <Text style={[styles.headerElapsed, { color: colors.text }]}>{timeDisplay}</Text>
                </View>
                <Text style={[styles.headerDateTime, { color: colors.textDim }]}>{dateFormatted}, {timeFormatted}</Text>
            </View>

            <View style={styles.cardBody}>
                {/* Status & Table */}
                <View style={[styles.subHeader, { borderBottomColor: colors.border }]}>
                    <View style={styles.statusWrap}>
                        <View style={[styles.statusDot, { backgroundColor: indicatorColor }]} />
                        <Text style={[styles.statusText, { color: indicatorColor }]}>
                            {item.status === 'Pending' ? 'Open' : item.status}
                        </Text>
                    </View>
                    <Text style={[styles.tableText, { color: colors.textMuted }]}>
                        {tableNum.toLowerCase() === 'takeaway' ? 'Takeaway' : `Table - ${tableNum}`}
                    </Text>
                </View>
                
                {/* Items List */}
                <View style={styles.itemsContainer}>
                    {item.items.map((it, i) => (
                        <View key={i} style={[styles.itemRowBlock, { borderBottomColor: colors.border }]}>
                            <View style={styles.itemRow}>
                                <Text style={styles.itemName}>
                                    <Text style={{fontWeight: '700', color: colors.text}}>{it.quantity}x</Text> <Text style={{color: colors.textMuted}}>{it.name}</Text>
                                </Text>
                                {/* Simple Checkmark logic based on global order status for mock purposes */}
                                <Feather 
                                    name={isTerminal || item.status === 'Ready' ? "check-circle" : "circle"} 
                                    size={16} 
                                    color={isTerminal || item.status === 'Ready' ? colors.green : colors.border} 
                                />
                            </View>
                        </View>
                    ))}
                </View>

                {/* Finish Button */}
                <TouchableOpacity 
                    style={[
                        styles.finishBtn, 
                        { backgroundColor: colors.surface2 },
                        isTerminal && { borderColor: colors.border },
                        !isTerminal && { borderColor: btnColor }
                    ]} 
                    disabled={isTerminal}
                    onPress={() => onAdvance(item)}
                    activeOpacity={0.8}
                >
                    <Text style={[
                        styles.finishBtnText, 
                        isTerminal && { color: colors.textDim },
                        !isTerminal && { color: btnColor }
                    ]}>
                        {isTerminal ? 'Finished' : (nextState ? `Mark ${nextState}` : 'Finish')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Main Screen Component ──────────────────────────────────────────────────

const ALL_STATUSES = ['All', 'Pending', 'Confirmed', 'Ready', 'Delivered', 'Cancelled'];

export function KanbanOrdersScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const restaurantId = user?.restaurantId ?? '';

    const [orders, setOrders] = useState<Order[]>([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [preferredVoice, setPreferredVoice] = useState<string | undefined>(undefined);

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

    const loadOrders = useCallback(async () => {
        if (!restaurantId) return;
        try {
            const data = await ordersApi.findAll(restaurantId);
            // Sort by most recent first
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(data);
        } catch { /* Ignore */ }
    }, [restaurantId]);

    useEffect(() => { loadOrders().finally(() => setLoading(false)); }, [loadOrders]);

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
        if (!isMountedRef.current) return;
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
            onStopped: () => {
                isSpeakingRef.current = false;
            },
            onError: () => {
                isSpeakingRef.current = false;
            }
        });
    }, [preferredVoice]);

    useEffect(() => {
        if (pendingOrdersRef.current.length > 0 && !isSpeakingRef.current) {
            announcementLoop();
        }
    }, [orders, announcementLoop]);

    // Poll every 2 seconds
    useEffect(() => {
        const interval = setInterval(loadOrders, 2000);
        return () => clearInterval(interval);
    }, [loadOrders]);

    useSocket(restaurantId, {
        'order:new': async (newOrder: Order) => {
            loadOrders();
        },
        'order:updated': () => loadOrders(),
    });

    const handleAdvance = async (order: Order) => {
        let next = NEXT_STATUS[order.status];
        if (!next) return;
        try {
            await ordersApi.updateStatus(order.id, next);
            loadOrders();
        } catch { Alert.alert('Error', 'Failed to update order'); }
    };

    if (loading) {
        return (
            <View style={[S.screen, { backgroundColor: colors.bg }]}>
                <ActivityIndicator style={{ marginTop: 80 }} color={colors.accent} size="large" />
            </View>
        );
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    };

    // Calculate active/completed counts for header
    const activeTableKeys = new Set(orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).map(o => getTableNum(o)));
    const activeTableCount = activeTableKeys.size;
    const tableKeys = new Set(orders.map(o => getTableNum(o)));

    const filteredOrders = filterStatus === 'All' ? orders : orders.filter(o => o.status === filterStatus);

    return (
        <View style={[S.screen, { backgroundColor: colors.bg }]}>
            {/* Standard App Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Orders</Text>
                    <Text style={[styles.sub, { color: colors.textMuted }]}>
                        {activeTableCount} active table{activeTableCount !== 1 ? 's' : ''} · {tableKeys.size} total
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => Speech.speak("Test voice message", { language: 'en-IN', voice: preferredVoice, rate: 0.85 })}
                    style={{ padding: 8, backgroundColor: colors.surface2, borderRadius: 8 }}
                >
                    <Feather name="volume-2" size={20} color={colors.accent} />
                </TouchableOpacity>
            </View>

            {/* Status Filter */}
            <View style={{ flexGrow: 0, flexShrink: 0 }}>
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
            </View>

            <ScrollView 
                contentContainerStyle={styles.gridContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
            >
                <View style={styles.grid}>
                    {filteredOrders.map(order => (
                        <View key={order.id} style={styles.cardWrapper}>
                            <KanbanCard item={order} onAdvance={handleAdvance} />
                        </View>
                    ))}
                </View>
                {filteredOrders.length === 0 && (
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                        {orders.length === 0 ? "No orders right now." : `No orders for "${filterStatus}".`}
                    </Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        ...S.shadow,
        padding: 16,
        paddingTop: 48,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
    },
    title: { fontSize: 24, fontWeight: '800' },
    sub: { fontSize: 13, marginTop: 2 },
    
    gridContainer: {
        padding: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginHorizontal: -8,
    },
    cardWrapper: {
        width: '100%',
        padding: 8,
        flexBasis: 320,
        flexGrow: 1,
        maxWidth: 450,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 60,
    },

    // Filter Tabs
    tabsContainer: {
        ...S.shadow, borderBottomWidth: 1, maxHeight: 80 },
    tabsContent: {
        paddingHorizontal: 10, paddingVertical: 14, flexDirection: 'row', alignItems: 'center' },
    tab: {
        ...S.shadow,
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 99,
        borderWidth: 1,
        marginRight: 8,
        flexShrink: 0,
        height: 40, justifyContent: 'center',
    },
    tabText: { fontSize: 13, fontWeight: '600' },

    // Card Styles
    card: {
        ...S.shadow,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
    },
    cardHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    headerOrderId: { fontSize: 14, fontWeight: '700' },
    headerElapsed: { fontSize: 12, fontWeight: '700' },
    headerDateTime: { fontSize: 12, opacity: 0.8 },
    
    cardBody: {
        padding: 16,
    },
    subHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        marginBottom: 12,
    },
    statusWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 13, fontWeight: '700' },
    tableText: { fontSize: 13, fontWeight: '600' },

    itemsContainer: {
        marginBottom: 20,
    },
    itemRowBlock: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    itemName: { fontSize: 14, flex: 1, paddingRight: 10 },
    itemVariant: {
        fontSize: 12,
        color: '#9ca3af',
        marginLeft: 20, // indent
    },
    finishBtn: {
        ...S.shadow,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    finishBtnText: {
        fontSize: 14,
        fontWeight: '700',
    },
});
