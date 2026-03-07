interface ConnectedRobot {
    robotId: string;
    socketId: string;
    restaurantId: string;
    lastHeartbeat: Date;
}
export declare class RobotRuntimeService {
    private connectedRobots;
    registerRobot(robotId: string, socketId: string, restaurantId: string): void;
    unregisterRobot(robotId: string): void;
    getRobot(robotId: string): ConnectedRobot | undefined;
    updateHeartbeat(robotId: string): void;
    findBySocketId(socketId: string): ConnectedRobot | undefined;
}
export {};
