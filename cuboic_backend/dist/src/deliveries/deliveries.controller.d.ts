import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
export declare class DeliveriesController {
    private readonly deliveriesService;
    constructor(deliveriesService: DeliveriesService);
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
    confirmStop(id: string, index: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        status: import("@prisma/client").$Enums.DeliveryStatus;
        stops: import("@prisma/client/runtime/library").JsonValue;
        robotId: string;
    }>;
}
