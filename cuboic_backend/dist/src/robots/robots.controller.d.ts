import { RobotsService } from './robots.service';
export declare class RobotsController {
    private readonly robotsService;
    constructor(robotsService: RobotsService);
    findAll(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        secretKey: string;
        status: import("@prisma/client").$Enums.RobotStatus;
        mode: import("@prisma/client").$Enums.RobotMode;
        currentDeliveryId: string | null;
        isOnline: boolean;
        lastSeen: Date | null;
        battery: number;
        location: import("@prisma/client/runtime/library").JsonValue;
        cabinets: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__RobotClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        secretKey: string;
        status: import("@prisma/client").$Enums.RobotStatus;
        mode: import("@prisma/client").$Enums.RobotMode;
        currentDeliveryId: string | null;
        isOnline: boolean;
        lastSeen: Date | null;
        battery: number;
        location: import("@prisma/client/runtime/library").JsonValue;
        cabinets: import("@prisma/client/runtime/library").JsonValue;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
