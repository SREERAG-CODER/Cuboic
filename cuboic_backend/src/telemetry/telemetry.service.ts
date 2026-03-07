import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RobotStatus } from '@prisma/client';

@Injectable()
export class TelemetryService {
    constructor(private prisma: PrismaService) { }

    getLatest(robotId: string) {
        return this.prisma.robotTelemetry.findFirst({
            where: { robotId },
            orderBy: { createdAt: 'desc' },
        });
    }

    getHistory(robotId: string, limit = 50) {
        return this.prisma.robotTelemetry.findMany({
            where: { robotId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async recordTelemetry(data: {
        robotId: string;
        battery: number;
        location: { x: number; y: number };
        status?: string;
    }) {
        return this.prisma.robotTelemetry.create({
            data: {
                robotId: data.robotId,
                battery: data.battery,
                location: data.location,
                status: (data.status ?? 'Idle') as RobotStatus,
            },
        });
    }
}
