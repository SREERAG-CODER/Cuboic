export const COLORS = {
    bg: '#0f0f13',
    surface: '#18181f',
    surface2: '#222230',
    border: '#2e2e3d',
    accent: '#65a30d',
    accentDark: '#4d7c0f',
    text: '#f0eff5',
    textMuted: '#8b8aa0',
    textDim: '#5a5974',
    green: '#22c55e',
    red: '#ef4444',
    blue: '#38bdf8',
    purple: '#a78bfa',
    amber: '#f5a623',
};

export const FONT = {
    regular: { fontWeight: '400' as const },
    medium: { fontWeight: '500' as const },
    bold: { fontWeight: '700' as const },
    heavy: { fontWeight: '800' as const },
};

export const S = {
    screen: {
        flex: 1 as const,
        backgroundColor: COLORS.bg,
        width: '100%' as const,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
    },
    container: {
        flex: 1 as const,
        padding: 16,
    },
    row: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700' as const,
        letterSpacing: 1.2,
        textTransform: 'uppercase' as const,
        color: COLORS.textMuted,
        marginBottom: 12,
    },
    btnPrimary: {
        backgroundColor: COLORS.accent,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center' as const,
    },
    btnPrimaryText: {
        color: '#0f0f13',
        fontWeight: '700' as const,
        fontSize: 16,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
        alignSelf: 'flex-start' as const,
    },
};

export function statusColor(status: string): string {
    const map: Record<string, string> = {
        // Order statuses
        Pending: '#f5a623',
        Confirmed: '#38bdf8',
        Preparing: '#a78bfa',
        Ready: '#22c55e',
        Assigned: '#38bdf8',
        Delivered: '#6b7280',
        Cancelled: '#ef4444',
        // Delivery statuses
        InTransit: '#f5a623',
        'In-Transit': '#f5a623',
        Completed: '#22c55e',
        // Robot status
        Idle: '#22c55e',
        Delivering: '#f5a623',
        Charging: '#38bdf8',
        Error: '#ef4444',
        // Payment
        Paid: '#22c55e',
        Received: '#f5a623',
        // Other
        Online: '#22c55e',
        Offline: '#6b7280',
        Free: '#22c55e',
        Occupied: '#f5a623',
    };
    return map[status] ?? COLORS.textMuted;
}
