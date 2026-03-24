import { OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RobotRuntimeService } from './robot-runtime.service';
import { RobotsService } from '../robots/robots.service';
import { TelemetryService } from '../telemetry/telemetry.service';
export declare class RobotRuntimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private runtimeService;
    private robotsService;
    private telemetryService;
    server: Server;
    constructor(runtimeService: RobotRuntimeService, robotsService: RobotsService, telemetryService: TelemetryService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleRobotConnect(data: any, client: Socket): Promise<Socket<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any> | undefined>;
    handleTelemetry(data: any, client: Socket): Promise<void>;
    handleHeartbeat(data: any, client: Socket): void;
}
