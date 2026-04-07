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
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../hooks/useSocket';
import { StatusBadge } from '../../components/StatusBadge';
import { FONT, S } from '../../theme';

interface CreateStop { orderId: string; tableId: string; cabinets: string[]; sequence: number; }

export function DeliveriesScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
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
        <View style={[S.screen, { backgroundColor: colors.bg }]}>
            <ActivityIndicator style={{ marginTop: 80 }} color={colors.accent} size="large" />
        </View>
    );

    return (
        <View style={[S.screen, { backgroundColor: colors.bg }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>Deliveries</Text>
                {user?.role === 'Staff' && (
                    <TouchableOpacity
                        style={[styles.newBtn, { backgroundColor: colors.accent }]}
                        onPress={() => setShowCreate(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.newBtnText}>+ New</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Tab bar */}
            <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.tabBtn, { backgroundColor: colors.surface2 }, tab === 'active' && { backgroundColor: colors.accent }]}
                    onPress={() => setTab('active')}
                >
                    <Text style={[styles.tabBtnText, { color: colors.textMuted }, tab === 'active' && { color: '#0f0f13' }]}>
                        Active ({active.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, { backgroundColor: colors.surface2 }, tab === 'history' && { backgroundColor: colors.accent }]}
                    onPress={() => setTab('history')}
                >
                    <Text style={[styles.tabBtnText, { color: colors.textMuted }, tab === 'history' && { color: '#0f0f13' }]}>
                        History ({history.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={displayList}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
                renderItem={({ item }) => (
                    <View style={[styles.delivCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.delivHeader}>
                            <Text style={[styles.delivId, { color: colors.text }]}>#{item.id.slice(-6).toUpperCase()}</Text>
                            <StatusBadge status={item.status} />
                            <Text style={[styles.delivTime, { color: colors.textDim }]}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
                        </View>
                        {item.stops.map((stop, si) => (
                            <View key={si} style={[styles.stop, { borderTopColor: colors.border }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.stopText, { color: colors.text }]}>Stop {stop.sequence} · {stop.cabinets.join(', ')}</Text>
                                    <StatusBadge status={stop.status} size="sm" />
                                </View>
                                {tab === 'active' && stop.status === 'Pending' && user?.role === 'Staff' && (
                                    <TouchableOpacity
                                        style={[styles.confirmBtn, { backgroundColor: colors.accent }]}
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
                        <Feather name="cpu" size={48} color={colors.textMuted} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No {tab === 'active' ? 'active' : 'past'} deliveries</Text>
                    </View>
                }
            />

            {/* Create Delivery Modal */}
            <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
                <KeyboardAvoidingView
                    style={{ flex: 1, backgroundColor: colors.bg }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView contentContainerStyle={styles.modal} keyboardShouldPersistTaps="handled">
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Delivery</Text>
                            <TouchableOpacity onPress={() => setShowCreate(false)}>
                                <Text style={[styles.modalClose, { color: colors.textMuted }]}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Robot Picker */}
                        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Select Robot</Text>
                        {idleRobots.length === 0 ? (
                            <Text style={[styles.noRobotsText, { color: colors.red }]}>No idle robots available</Text>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                                {idleRobots.map(r => (
                                    <TouchableOpacity
                                        key={r.id}
                                        style={[styles.robotOption, { backgroundColor: colors.surface2, borderColor: colors.border }, selectedRobot === r.id && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                                        onPress={() => setSelectedRobot(r.id)}
                                    >
                                        <Feather name="cpu" size={22} color={selectedRobot === r.id ? '#000' : colors.textMuted} style={{ marginBottom: 4 }} />
                                        <Text style={[styles.robotOptionText, { color: colors.textMuted }, selectedRobot === r.id && { color: '#000' }]}>
                                            {r.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {/* Stops */}
                        {stops.map((stop, si) => (
                            <View key={si} style={[styles.stopBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={[styles.stopBlockTitle, { color: colors.text }]}>Stop {stop.sequence}</Text>

                                <Text style={[styles.fieldLabelSm, { color: colors.textDim }]}>Order (Ready)</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                                    {readyOrders.map(o => {
                                        const tableNum = typeof o.tableId === 'object'
                                            ? (o.tableId as any).table_number
                                            : String(o.tableId).slice(-4);
                                        return (
                                            <TouchableOpacity
                                                key={o.id}
                                                style={[styles.orderOption, { backgroundColor: colors.surface2, borderColor: colors.border }, stop.orderId === o.id && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                                                onPress={() => handleStopOrderChange(si, o.id)}
                                            >
                                                <Text style={[styles.orderOptionText, { color: colors.textMuted }, stop.orderId === o.id && { color: '#000' }]}>
                                                    Table {tableNum} · ₹{o.total.toFixed(0)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                <Text style={[styles.fieldLabelSm, { color: colors.textDim }]}>Cabinets</Text>
                                <View style={styles.cabinetsRow}>
                                    {(selectedRobotObj?.cabinets ?? [{ id: 'C1' }, { id: 'C2' }, { id: 'C3' }]).map(cab => (
                                        <TouchableOpacity
                                            key={cab.id}
                                            style={[styles.cabBtn, { backgroundColor: colors.surface2, borderColor: colors.border }, stop.cabinets.includes(cab.id) && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                                            onPress={() => handleCabinetToggle(si, cab.id)}
                                        >
                                            <Text style={[styles.cabBtnText, { color: colors.textMuted }, stop.cabinets.includes(cab.id) && { color: '#000' }]}>
                                                {cab.id}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={[styles.addStopBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
                            onPress={() => setStops(prev => [...prev, { orderId: '', tableId: '', cabinets: [], sequence: prev.length + 1 }])}
                        >
                            <Text style={[styles.addStopBtnText, { color: colors.textMuted }]}>+ Add Stop</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.dispatchBtn, { backgroundColor: colors.accent }, creating && { opacity: 0.6 }]}
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
        ...S.shadow,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, paddingTop: 48, borderBottomWidth: 1,
    },
    title: { fontSize: 26, fontWeight: '800' },
    newBtn: {
        ...S.shadow, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
    newBtnText: { color: '#0f0f13', fontWeight: '700', fontSize: 14 },
    tabBar: {
        ...S.shadow,
        flexDirection: 'row', borderBottomWidth: 1, padding: 12, gap: 8,
    },
    tabBtn: {
        ...S.shadow,
        flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
    },
    tabBtnText: { fontWeight: '600', fontSize: 14 },
    list: { padding: 16, gap: 12, paddingBottom: 32 },
    delivCard: {
        ...S.shadow,
        borderRadius: 14, borderWidth: 1, padding: 14, gap: 10,
    },
    delivHeader: {
        ...S.shadow, flexDirection: 'row', alignItems: 'center', gap: 10 },
    delivId: { flex: 1, fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
    delivTime: { fontSize: 11 },
    stop: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingTop: 10, borderTopWidth: 1,
    },
    stopText: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
    confirmBtn: {
        ...S.shadow, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, gap: 4 },
    confirmBtnText: { color: '#000', fontWeight: '700', fontSize: 13 },
    empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 14 },
    // Modal
    modal: { padding: 20, paddingBottom: 48 },
    modalHeader: {
        ...S.shadow, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingTop: 12 },
    modalTitle: { fontSize: 22, fontWeight: '800' },
    modalClose: { fontSize: 22 },
    fieldLabel: { fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
    fieldLabelSm: { fontSize: 11, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    noRobotsText: { marginBottom: 16, fontSize: 13 },
    robotOption: {
        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
        borderWidth: 1, marginRight: 10, alignItems: 'center', minWidth: 80,
    },
    robotOptionText: { fontSize: 12, fontWeight: '600' },
    stopBlock: {
        borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12,
    },
    stopBlockTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
    orderOption: {
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
        borderWidth: 1, marginRight: 8,
    },
    orderOptionText: { fontSize: 13, fontWeight: '500' },
    cabinetsRow: { flexDirection: 'row', gap: 10 },
    cabBtn: {
        ...S.shadow,
        paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
        borderWidth: 1,
    },
    cabBtnText: { fontWeight: '700', fontSize: 15 },
    addStopBtn: {
        ...S.shadow,
        borderRadius: 12, padding: 14,
        alignItems: 'center', borderWidth: 1, marginBottom: 12,
    },
    addStopBtnText: { fontWeight: '700', fontSize: 14 },
    dispatchBtn: {
        ...S.shadow, flexDirection: 'row', justifyContent: 'center', borderRadius: 12, padding: 16, alignItems: 'center' },
    dispatchBtnText: { color: '#0f0f13', fontWeight: '800', fontSize: 16 },
});
