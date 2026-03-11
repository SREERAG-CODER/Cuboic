import { PrismaService } from '../prisma/prisma.service';
export declare class TelemetryService {
    private prisma;
    constructor(prisma: PrismaService);
    getLatest(robotId: string): import("@prisma/client").Prisma.Prisma__RobotTelemetryClient<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.RobotStatus;
        battery: number;
        location: import("@prisma/client/runtime/library").JsonValue;
        robotId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getHistory(robotId: string, limit?: number): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.RobotStatus;
        battery: number;
        location: import("@prisma/client/runtime/library").JsonValue;
        robotId: string;
    }[]>;
    recordTelemetry(data: {
        robotId: string;
        battery: number;
        location: {
            x: number;
            y: number;
        };
        status?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.RobotStatus;
        battery: number;
        location: import("@prisma/client/runtime/library").JsonValue;
        robotId: string;
    }>;
}
