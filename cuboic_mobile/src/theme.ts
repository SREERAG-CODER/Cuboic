export const DARK_COLORS = {
    bg: '#121212', // Matte black background
    surface: '#1e1e1e', // Elevated matte surface
    surface2: '#2c2c2c',
    border: '#3f6212', // Distinct dark green border
    accent: '#65a30d',
    accentDark: '#4d7c0f',
    text: '#ffffff',
    textMuted: '#a1a1aa',
    textDim: '#71717a',
    green: '#22c55e',
    red: '#ef4444',
    blue: '#38bdf8',
    purple: '#a78bfa',
    amber: '#f5a623',
};

export const LIGHT_COLORS = {
    bg: '#eaedf2', // Light grey background
    surface: '#ffffff', // White surface to pop over light grey
    surface2: '#f1f5f9',
    border: '#bbf7d0', // Distinct light green border
    accent: '#65a30d',      // Keeping the brand green
    accentDark: '#4d7c0f',
    text: '#0f172a',
    textMuted: '#64748b',
    textDim: '#94a3b8',
    green: '#16a34a',
    red: '#dc2626',
    blue: '#0284c7',
    purple: '#7c3aed',
    amber: '#d97706',
};

export type ThemeColors = typeof DARK_COLORS;
export const COLORS = DARK_COLORS; // Default to dark for backwards compatibility during migration

export const FONT = {
    regular: { fontWeight: '400' as const },
    medium: { fontWeight: '500' as const },
    bold: { fontWeight: '700' as const },
    heavy: { fontWeight: '800' as const },
};

const SHADOW = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
};

export const S = {
    shadow: SHADOW,
    textShadow: {
        textShadowColor: 'rgba(0,0,0,0.15)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    screen: {
        flex: 1 as const,
        backgroundColor: COLORS.bg,
        width: '100%' as const,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        ...SHADOW, // Makes the card hover
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
        ...SHADOW, // Makes the button hover
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

export function getStatusColor(status: string, colors: ThemeColors): string {
    const map: Record<string, string> = {
        // Order statuses
        Pending: colors.amber,
        Confirmed: colors.blue,
        Preparing: colors.purple,
        Ready: colors.green,
        Assigned: colors.blue,
        Delivered: colors.textDim,
        Cancelled: colors.red,
        // Delivery statuses
        InTransit: colors.amber,
        'In-Transit': colors.amber,
        Completed: colors.green,
        // Robot status
        Idle: colors.green,
        Delivering: colors.amber,
        Charging: colors.blue,
        Error: colors.red,
        // Payment
        Paid: colors.green,
        Received: colors.amber,
        // Other
        Online: colors.green,
        Offline: colors.textDim,
        Free: colors.green,
        Occupied: colors.amber,
    };
    return map[status] ?? colors.textMuted;
}
