import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { RobotRuntimeService } from './robot-runtime.service';
import { RobotsService } from '../robots/robots.service';
import { TelemetryService } from '../telemetry/telemetry.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class RobotRuntimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private runtimeService: RobotRuntimeService,
    private robotsService: RobotsService,
    private telemetryService: TelemetryService,
  ) { }

  // 🔹 When any socket connects
  async handleConnection(client: Socket) {
    console.log('Socket connected:', client.id);
  }

  // 🔹 When socket disconnects
  async handleDisconnect(client: Socket) {
    const robot = this.runtimeService.findBySocketId(client.id);

    if (robot) {
      await this.robotsService.markOffline(robot.robotId);
      this.runtimeService.unregisterRobot(robot.robotId);
      console.log(`Robot ${robot.robotId} disconnected`);
    }
  }

  // 🔹 Robot authentication handshake
  @SubscribeMessage('robot_connect')
  async handleRobotConnect(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
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

    this.runtimeService.registerRobot(
      robotId,
      client.id,
      robot.restaurantId.toString(),
    );

    client.join(robotId);

    console.log(`Robot ${robotId} authenticated & connected`);
  }

  // 🔹 Telemetry handler
  @SubscribeMessage('robot_telemetry')
  async handleTelemetry(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { robotId, telemetry } = data;

    console.log('Telemetry received:', data);

    const runtimeRobot = this.runtimeService.getRobot(robotId);

    // Security check: ensure telemetry comes from correct socket
    if (!runtimeRobot || runtimeRobot.socketId !== client.id) {
      console.log('Unauthorized telemetry attempt');
      return;
    }

    // 1️⃣ Store historical telemetry
    await this.telemetryService.recordTelemetry({
      robotId,
      battery: telemetry.battery,
      location: telemetry.location,
    });

    // 2️⃣ Update robot snapshot
    await this.robotsService.updateTelemetry(robotId, telemetry);

    // 3️⃣ Update heartbeat
    this.runtimeService.updateHeartbeat(robotId);

    // 4️⃣ Emit live update
    this.server.to(robotId).emit('telemetry_update', telemetry);
  }

  // 🔹 Optional heartbeat event
  @SubscribeMessage('robot_heartbeat')
  handleHeartbeat(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { robotId } = data;

    const runtimeRobot = this.runtimeService.getRobot(robotId);

    if (runtimeRobot && runtimeRobot.socketId === client.id) {
      this.runtimeService.updateHeartbeat(robotId);
    }
  }
}