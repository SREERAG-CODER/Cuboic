import StatusBadge from './StatusBadge'

interface Cabinet {
    id: string
    status: 'Free' | 'Occupied'
}

interface Robot {
    _id: string
    name: string
    status: string
    isOnline: boolean
    battery: number
    location: { x: number; y: number }
    cabinets: Cabinet[]
    mode: string
}

export default function RobotCard({ robot }: { robot: Robot }) {
    const batteryColour =
        robot.battery > 50 ? 'battery-high' : robot.battery > 20 ? 'battery-mid' : 'battery-low'

    return (
        <div className={`robot-card ${robot.isOnline ? 'robot-online' : 'robot-offline'}`}>
            <div className="robot-card-header">
                <div className="robot-name">
                    <span className={`online-dot ${robot.isOnline ? 'dot-green' : 'dot-grey'}`} />
                    {robot.name}
                </div>
                <StatusBadge status={robot.status} />
            </div>

            <div className="robot-battery-row">
                <span className="battery-label">Battery</span>
                <div className="battery-bar-bg">
                    <div
                        className={`battery-bar-fill ${batteryColour}`}
                        style={{ width: `${robot.battery}%` }}
                    />
                </div>
                <span className="battery-pct">{robot.battery}%</span>
            </div>

            <div className="robot-cabinets">
                {robot.cabinets.map((cab) => (
                    <div
                        key={cab.id}
                        className={`cabinet-chip ${cab.status === 'Occupied' ? 'cabinet-occupied' : 'cabinet-free'}`}
                    >
                        {cab.id}
                        <span className="cabinet-status">{cab.status}</span>
                    </div>
                ))}
            </div>

            <div className="robot-meta">
                <span>Mode: <strong>{robot.mode}</strong></span>
                <span>Pos: ({robot.location.x}, {robot.location.y})</span>
            </div>
        </div>
    )
}
