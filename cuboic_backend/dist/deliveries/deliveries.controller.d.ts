import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
export declare class DeliveriesController {
    private readonly deliveriesService;
    constructor(deliveriesService: DeliveriesService);
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
    confirmStop(id: string, index: string): Promise<{
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DeliveryStatus;
        robotId: string;
        stops: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
