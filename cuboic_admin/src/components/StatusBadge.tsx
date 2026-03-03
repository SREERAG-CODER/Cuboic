type BadgeVariant =
    | 'Pending'
    | 'Confirmed'
    | 'Preparing'
    | 'Ready'
    | 'Assigned'
    | 'Delivered'
    | 'Cancelled'
    | 'InTransit'
    | 'Completed'
    | 'Idle'
    | 'Delivering'
    | 'Returning'
    | 'Charging'
    | 'Error'
    | 'Paid'
    | 'Refunded'

const colours: Record<BadgeVariant, string> = {
    Pending: 'badge-yellow',
    Confirmed: 'badge-blue',
    Preparing: 'badge-orange',
    Ready: 'badge-green',
    Assigned: 'badge-purple',
    Delivered: 'badge-teal',
    Cancelled: 'badge-red',
    InTransit: 'badge-blue',
    Completed: 'badge-green',
    Idle: 'badge-grey',
    Delivering: 'badge-amber',
    Returning: 'badge-indigo',
    Charging: 'badge-teal',
    Error: 'badge-red',
    Paid: 'badge-green',
    Refunded: 'badge-indigo',
}

export default function StatusBadge({ status }: { status: string }) {
    const cls = colours[status as BadgeVariant] ?? 'badge-grey'
    return <span className={`badge ${cls}`}>{status}</span>
}
