import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
export declare class DeliveriesService {
    private prisma;
    private readonly eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    create(dto: CreateDeliveryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        status: import("@prisma/client").$Enums.DeliveryStatus;
        stops: import("@prisma/client/runtime/library").JsonValue;
        robotId: string;
    }>;
    findActive(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        status: import("@prisma/client").$Enums.DeliveryStatus;
        stops: import("@prisma/client/runtime/library").JsonValue;
        robotId: string;
    }[]>;
    findAll(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        status: import("@prisma/client").$Enums.DeliveryStatus;
        stops: import("@prisma/client/runtime/library").JsonValue;
        robotId: string;
    }[]>;
    confirmStop(deliveryId: string, stopIndex: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        status: import("@prisma/client").$Enums.DeliveryStatus;
        stops: import("@prisma/client/runtime/library").JsonValue;
        robotId: string;
    }>;
}
