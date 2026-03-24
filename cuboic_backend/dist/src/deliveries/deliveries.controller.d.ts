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
        robotId: string;
        stops: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findActive(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        status: import("@prisma/client").$Enums.DeliveryStatus;
        robotId: string;
        stops: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    findAll(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        status: import("@prisma/client").$Enums.DeliveryStatus;
        robotId: string;
        stops: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    confirmStop(id: string, index: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        status: import("@prisma/client").$Enums.DeliveryStatus;
        robotId: string;
        stops: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
