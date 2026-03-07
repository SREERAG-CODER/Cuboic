import { TelemetryService } from './telemetry.service';
export declare class TelemetryController {
    private readonly telemetryService;
    constructor(telemetryService: TelemetryService);
    getLatest(robotId: string): import("@prisma/client").Prisma.Prisma__RobotTelemetryClient<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.RobotStatus;
        battery: number;
        location: import("@prisma/client/runtime/library").JsonValue;
        robotId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getHistory(robotId: string, limit?: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.RobotStatus;
        battery: number;
        location: import("@prisma/client/runtime/library").JsonValue;
        robotId: string;
    }[]>;
}
