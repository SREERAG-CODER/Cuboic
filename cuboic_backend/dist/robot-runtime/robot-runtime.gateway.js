"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotRuntimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const robot_runtime_service_1 = require("./robot-runtime.service");
const robots_service_1 = require("../robots/robots.service");
const telemetry_service_1 = require("../telemetry/telemetry.service");
let RobotRuntimeGateway = class RobotRuntimeGateway {
    runtimeService;
    robotsService;
    telemetryService;
    server;
    constructor(runtimeService, robotsService, telemetryService) {
        this.runtimeService = runtimeService;
        this.robotsService = robotsService;
        this.telemetryService = telemetryService;
    }
    async handleConnection(client) {
        console.log('Socket connected:', client.id);
    }
    async handleDisconnect(client) {
        const robot = this.runtimeService.findBySocketId(client.id);
        if (robot) {
            await this.robotsService.markOffline(robot.robotId);
            this.runtimeService.unregisterRobot(robot.robotId);
            console.log(`Robot ${robot.robotId} disconnected`);
        }
    }
    async handleRobotConnect(data, client) {
        const { robotId, secretKey } = data;
        console.log('robot_connect received:', data);
        if (!robotId || !secretKey) {
            client.emit('auth_failed');
            return client.disconnect();
        }
        const robot = await this.robotsService.findByIdWithSecret(robotId);
        if (!robot || robot.secretKey !== secretKey) {
            client.emit('auth_failed');
            return client.disconnect();
        }
        await this.robotsService.markOnline(robotId);
        this.runtimeService.registerRobot(robotId, client.id, robot.restaurantId.toString());
        client.join(robotId);
        console.log(`Robot ${robotId} authenticated & connected`);
    }
    async handleTelemetry(data, client) {
        const { robotId, telemetry } = data;
        console.log('Telemetry received:', data);
        const runtimeRobot = this.runtimeService.getRobot(robotId);
        if (!runtimeRobot || runtimeRobot.socketId !== client.id) {
            console.log('Unauthorized telemetry attempt');
            return;
        }
        await this.telemetryService.recordTelemetry({
            robotId,
            battery: telemetry.battery,
            location: telemetry.location,
        });
        await this.robotsService.updateTelemetry(robotId, telemetry);
        this.runtimeService.updateHeartbeat(robotId);
        this.server.to(robotId).emit('telemetry_update', telemetry);
    }
    handleHeartbeat(data, client) {
        const { robotId } = data;
        const runtimeRobot = this.runtimeService.getRobot(robotId);
        if (runtimeRobot && runtimeRobot.socketId === client.id) {
            this.runtimeService.updateHeartbeat(robotId);
        }
    }
};
exports.RobotRuntimeGateway = RobotRuntimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RobotRuntimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('robot_connect'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RobotRuntimeGateway.prototype, "handleRobotConnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('robot_telemetry'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RobotRuntimeGateway.prototype, "handleTelemetry", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('robot_heartbeat'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RobotRuntimeGateway.prototype, "handleHeartbeat", null);
exports.RobotRuntimeGateway = RobotRuntimeGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
    }),
    __metadata("design:paramtypes", [robot_runtime_service_1.RobotRuntimeService,
        robots_service_1.RobotsService,
        telemetry_service_1.TelemetryService])
], RobotRuntimeGateway);
//# sourceMappingURL=robot-runtime.gateway.js.map