import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
    @WebSocketServer()
    server: Server;

    emitToRestaurant(restaurantId: string, event: string, data: any) {
        this.server.emit(`${event}:${restaurantId}`, data);
    }
}
