"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotRuntimeService = void 0;
const common_1 = require("@nestjs/common");
let RobotRuntimeService = class RobotRuntimeService {
    connectedRobots = new Map();
    registerRobot(robotId, socketId, restaurantId) {
        this.connectedRobots.set(robotId, {
            robotId,
            socketId,
            restaurantId,
            lastHeartbeat: new Date(),
        });
    }
    unregisterRobot(robotId) {
        this.connectedRobots.delete(robotId);
    }
    getRobot(robotId) {
        return this.connectedRobots.get(robotId);
    }
    updateHeartbeat(robotId) {
        const robot = this.connectedRobots.get(robotId);
        if (robot)
            robot.lastHeartbeat = new Date();
    }
    findBySocketId(socketId) {
        for (const robot of this.connectedRobots.values()) {
            if (robot.socketId === socketId)
                return robot;
        }
        return undefined;
    }
};
exports.RobotRuntimeService = RobotRuntimeService;
exports.RobotRuntimeService = RobotRuntimeService = __decorate([
    (0, common_1.Injectable)()
], RobotRuntimeService);
//# sourceMappingURL=robot-runtime.service.js.map