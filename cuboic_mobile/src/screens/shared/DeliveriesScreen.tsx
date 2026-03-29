import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    RefreshControl, ActivityIndicator, Alert, ScrollView, Modal,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { deliveriesApi, robotsApi, type Delivery, type Robot } from '../../api/deliveries';
import { ordersApi, type Order } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { StatusBadge } from '../../components/StatusBadge';
import { COLORS, S } from '../../theme';

interface CreateStop { orderId: string; tableId: string; cabinets: string[]; sequence: number; }

export function DeliveriesScreen() {
    const { user } = useAuth();
    const restaurantId = user?.restaurantId ?? '';

    const [tab, setTab] = useState<'active' | 'history'>('active');
    const [active, setActive] = useState<Delivery[]>([]);
    const [history, setHistory] = useState<Delivery[]>([]);
    const [robots, setRobots] = useState<Robot[]>([]);
    const [readyOrders, setReadyOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Create delivery form
    const [showCreate, setShowCreate] = useState(false);
    const [selectedRobot, setSelectedRobot] = useState('');
    const [stops, setStops] = useState<CreateStop[]>([{ orderId: '', tableId: '', cabinets: [], sequence: 1 }]);
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        if (!restaurantId) return;
        try {
            const [activeRes, allRes, robotsRes, ordersRes] = await Promise.all([
                deliveriesApi.findActive(restaurantId),
                deliveriesApi.findAll(restaurantId),
                robotsApi.findAll(restaurantId),
                ordersApi.findAll(restaurantId, 'Ready'),
            ]);
            setActive(activeRes);
            setHistory(allRes.filter(d => d.status !== 'InTransit'));
            setRobots(robotsRes);
            setReadyOrders(ordersRes);
        } catch { /* ignore */ }
    }, [restaurantId]);

    useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

    useSocket(restaurantId, {
        'delivery:started': () => load(),
        'delivery:updated': () => load(),
        'order:updated': () => load(),
    });

    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const handleConfirmStop = async (deliveryId: string, stopIndex: number) => {
        try {
            await deliveriesApi.confirmStop(deliveryId, stopIndex);
            load();
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message ?? 'Failed to confirm stop');
        }
    };

    const handleCabinetToggle = (stopIdx: number, cabId: string) => {
        setStops(prev => prev.map((s, i) => {
            if (i !== stopIdx) return s;
            const has = s.cabinets.includes(cabId);
            return { ...s, cabinets: has ? s.cabinets.filter(c => c !== cabId) : [...s.cabinets, cabId] };
        }));
    };

    const handleStopOrderChange = (idx: number, orderId: string) => {
        const order = readyOrders.find(o => o.id === orderId);
        const tableId = order ? (typeof order.tableId === 'string' ? order.tableId : String((order.tableId as any)?.table_number ?? '')) : '';
        setStops(prev => prev.map((s, i) => i === idx ? { ...s, orderId, tableId } : s));
    };

    const handleCreateDelivery = async () => {
        const robotObj = robots.find(r => r.id === selectedRobot);
        if (!selectedRobot || stops.some(s => !s.orderId || s.cabinets.length === 0)) {
            Alert.alert('Validation', 'Select a robot, order and at least one cabinet for each stop.');
            return;
        }
        setCreating(true);
        try {
            await deliveriesApi.create({
                restaurantId,
                robotId: selectedRobot,
                stops: stops.map(s => ({
                    orderId: s.orderId,
                    tableId: s.tableId,
                    cabinets: s.cabinets,
                    sequence: s.sequence,
                })),
            });
            setShowCreate(false);
            setSelectedRobot('');
            setStops([{ orderId: '', tableId: '', cabinets: [], sequence: 1 }]);
            Alert.alert('Success', 'Robot dispatched!');
            load();
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message ?? 'Failed to create delivery');
        } finally {
            setCreating(false);
        }
    };

    const idleRobots = robots.filter(r => r.status === 'Idle');
    const selectedRobotObj = robots.find(r => r.id === selectedRobot);
    const displayList = tab === 'active' ? active : history;

    if (loading) return (
        <View style={S.screen}>
            <ActivityIndicator style={{ marginTop: 80 }} color={COLORS.accent} size="large" />
        </View>
    );

    return (
        <View style={S.screen}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Deliveries</Text>
                {user?.role === 'Staff' && (
                    <TouchableOpacity
                        style={styles.newBtn}
                        onPress={() => setShowCreate(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.newBtnText}>+ New</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Tab bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'active' && styles.tabBtnActive]}
                    onPress={() => setTab('active')}
                >
                    <Text style={[styles.tabBtnText, tab === 'active' && styles.tabBtnTextActive]}>
                        Active ({active.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'history' && styles.tabBtnActive]}
                    onPress={() => setTab('history')}
                >
                    <Text style={[styles.tabBtnText, tab === 'history' && styles.tabBtnTextActive]}>
                        History ({history.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={displayList}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
                renderItem={({ item }) => (
                    <View style={styles.delivCard}>
                        <View style={styles.delivHeader}>
                            <Text style={styles.delivId}>#{item.id.slice(-6).toUpperCase()}</Text>
                            <StatusBadge status={item.status} />
                            <Text style={styles.delivTime}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
                        </View>
                        {item.stops.map((stop, si) => (
                            <View key={si} style={styles.stop}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.stopText}>Stop {stop.sequence} · {stop.cabinets.join(', ')}</Text>
                                    <StatusBadge status={stop.status} size="sm" />
                                </View>
                                {tab === 'active' && stop.status === 'Pending' && user?.role === 'Staff' && (
                                    <TouchableOpacity
                                        style={styles.confirmBtn}
                                        onPress={() => handleConfirmStop(item.id, si)}
                                        activeOpacity={0.8}
                                    >
                                        <Feather name="check" size={14} color="#000" />
                                        <Text style={styles.confirmBtnText}>Done</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Feather name="cpu" size={48} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>No {tab === 'active' ? 'active' : 'past'} deliveries</Text>
                    </View>
                }
            />

            {/* Create Delivery Modal */}
            <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
                <KeyboardAvoidingView
                    style={{ flex: 1, backgroundColor: COLORS.bg }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView contentContainerStyle={styles.modal} keyboardShouldPersistTaps="handled">
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Delivery</Text>
                            <TouchableOpacity onPress={() => setShowCreate(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Robot Picker */}
                        <Text style={styles.fieldLabel}>Select Robot</Text>
                        {idleRobots.length === 0 ? (
                            <Text style={styles.noRobotsText}>No idle robots available</Text>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                                {idleRobots.map(r => (
                                    <TouchableOpacity
                                        key={r.id}
                                        style={[styles.robotOption, selectedRobot === r.id && styles.robotOptionActive]}
                                        onPress={() => setSelectedRobot(r.id)}
                                    >
                                        <Feather name="cpu" size={22} color={selectedRobot === r.id ? '#000' : COLORS.textMuted} style={{ marginBottom: 4 }} />
                                        <Text style={[styles.robotOptionText, selectedRobot === r.id && { color: '#000' }]}>
                                            {r.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {/* Stops */}
                        {stops.map((stop, si) => (
                            <View key={si} style={styles.stopBlock}>
                                <Text style={styles.stopBlockTitle}>Stop {stop.sequence}</Text>

                                <Text style={styles.fieldLabelSm}>Order (Ready)</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                                    {readyOrders.map(o => {
                                        const tableNum = typeof o.tableId === 'object'
                                            ? (o.tableId as any).table_number
                                            : String(o.tableId).slice(-4);
                                        return (
                                            <TouchableOpacity
                                                key={o.id}
                                                style={[styles.orderOption, stop.orderId === o.id && styles.orderOptionActive]}
                                                onPress={() => handleStopOrderChange(si, o.id)}
                                            >
                                                <Text style={[styles.orderOptionText, stop.orderId === o.id && { color: '#000' }]}>
                                                    Table {tableNum} · ₹{o.total.toFixed(0)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                <Text style={styles.fieldLabelSm}>Cabinets</Text>
                                <View style={styles.cabinetsRow}>
                                    {(selectedRobotObj?.cabinets ?? [{ id: 'C1' }, { id: 'C2' }, { id: 'C3' }]).map(cab => (
                                        <TouchableOpacity
                                            key={cab.id}
                                            style={[styles.cabBtn, stop.cabinets.includes(cab.id) && styles.cabBtnActive]}
                                            onPress={() => handleCabinetToggle(si, cab.id)}
                                        >
                                            <Text style={[styles.cabBtnText, stop.cabinets.includes(cab.id) && { color: '#000' }]}>
                                                {cab.id}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.addStopBtn}
                            onPress={() => setStops(prev => [...prev, { orderId: '', tableId: '', cabinets: [], sequence: prev.length + 1 }])}
                        >
                            <Text style={styles.addStopBtnText}>+ Add Stop</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.dispatchBtn, creating && { opacity: 0.6 }]}
                            onPress={handleCreateDelivery}
                            disabled={creating}
                            activeOpacity={0.8}
                        >
                            <Feather name="send" size={18} color="#0f0f13" style={{ marginRight: 8 }} />
                            <Text style={styles.dispatchBtnText}>{creating ? 'Dispatching…' : 'Dispatch Robot'}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, paddingTop: 48, backgroundColor: COLORS.surface,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
    newBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
    newBtnText: { color: '#0f0f13', fontWeight: '700', fontSize: 14 },
    tabBar: {
        flexDirection: 'row', backgroundColor: COLORS.surface,
        borderBottomWidth: 1, borderBottomColor: COLORS.border, padding: 12, gap: 8,
    },
    tabBtn: {
        flex: 1, paddingVertical: 8, borderRadius: 10,
        backgroundColor: COLORS.surface2, alignItems: 'center',
    },
    tabBtnActive: { backgroundColor: COLORS.accent },
    tabBtnText: { fontWeight: '600', color: COLORS.textMuted, fontSize: 14 },
    tabBtnTextActive: { color: '#0f0f13' },
    list: { padding: 16, gap: 12, paddingBottom: 32 },
    delivCard: {
        backgroundColor: COLORS.surface, borderRadius: 14,
        borderWidth: 1, borderColor: COLORS.border, padding: 14, gap: 10,
    },
    delivHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    delivId: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.text, fontVariant: ['tabular-nums'] },
    delivTime: { fontSize: 11, color: COLORS.textDim },
    stop: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border,
    },
    stopText: { fontSize: 13, color: COLORS.text, fontWeight: '500', marginBottom: 4 },
    confirmBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, gap: 4 },
    confirmBtnText: { color: '#000', fontWeight: '700', fontSize: 13 },
    empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyIcon: { fontSize: 48 },
    emptyText: { color: COLORS.textMuted, fontSize: 14 },
    // Modal
    modal: { padding: 20, paddingBottom: 48 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingTop: 12 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
    modalClose: { fontSize: 22, color: COLORS.textMuted },
    fieldLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
    fieldLabelSm: { fontSize: 11, fontWeight: '700', color: COLORS.textDim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    noRobotsText: { color: COLORS.red, marginBottom: 16, fontSize: 13 },
    robotOption: {
        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
        backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border,
        marginRight: 10, alignItems: 'center', minWidth: 80,
    },
    robotOptionActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    robotOptionIcon: { fontSize: 22, marginBottom: 4 },
    robotOptionText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
    stopBlock: {
        backgroundColor: COLORS.surface, borderRadius: 12,
        borderWidth: 1, borderColor: COLORS.border,
        padding: 14, marginBottom: 12,
    },
    stopBlockTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
    orderOption: {
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
        backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, marginRight: 8,
    },
    orderOptionActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    orderOptionText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
    cabinetsRow: { flexDirection: 'row', gap: 10 },
    cabBtn: {
        paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
        backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border,
    },
    cabBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    cabBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 15 },
    addStopBtn: {
        backgroundColor: COLORS.surface2, borderRadius: 12, padding: 14,
        alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
    },
    addStopBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 14 },
    dispatchBtn: { flexDirection: 'row', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: 12, padding: 16, alignItems: 'center' },
    dispatchBtnText: { color: '#0f0f13', fontWeight: '800', fontSize: 16 },
});
