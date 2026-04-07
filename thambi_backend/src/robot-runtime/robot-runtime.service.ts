import { Injectable } from '@nestjs/common';

interface ConnectedRobot {
    robotId: string;
    socketId: string;
    restaurantId: string;
    lastHeartbeat: Date;
}

@Injectable()
export class RobotRuntimeService {
    private connectedRobots = new Map<string, ConnectedRobot>();

    registerRobot(robotId: string, socketId: string, restaurantId: string) {
        this.connectedRobots.set(robotId, {
            robotId,
            socketId,
            restaurantId,
            lastHeartbeat: new Date(),
        });
    }

    unregisterRobot(robotId: string) {
        this.connectedRobots.delete(robotId);
    }

    getRobot(robotId: string) {
        return this.connectedRobots.get(robotId);
    }

    updateHeartbeat(robotId: string) {
        const robot = this.connectedRobots.get(robotId);
        if (robot) robot.lastHeartbeat = new Date();
    }

    findBySocketId(socketId: string): ConnectedRobot | undefined {
        for (const robot of this.connectedRobots.values()) {
            if (robot.socketId === socketId) return robot;
        }
        return undefined;
    }
}