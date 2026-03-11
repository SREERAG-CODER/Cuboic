import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
export declare class DeliveriesService {
    private prisma;
    private readonly eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    create(dto: CreateDeliveryDto): Promise<{
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DeliveryStatus;
        robotId: string;
        stops: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findActive(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DeliveryStatus;
        robotId: string;
        stops: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    findAll(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DeliveryStatus;
        robotId: string;
        stops: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    confirmStop(deliveryId: string, stopIndex: number): Promise<{
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DeliveryStatus;
        robotId: string;
        stops: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
