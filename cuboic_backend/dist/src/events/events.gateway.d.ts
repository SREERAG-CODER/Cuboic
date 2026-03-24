import { Server } from 'socket.io';
export declare class EventsGateway {
    server: Server;
    emitToRestaurant(restaurantId: string, event: string, data: any): void;
}
