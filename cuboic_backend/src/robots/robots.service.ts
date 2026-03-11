import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RobotsService {
    constructor(private prisma: PrismaService) { }

    findAll(restaurantId: string) {
        return this.prisma.robot.findMany({ where: { restaurantId } });
    }

    findOne(id: string) {
        return this.prisma.robot.findUnique({ where: { id } });
    }

    async findByIdWithSecret(robotId: string) {
        return this.prisma.robot.findUnique({ where: { id: robotId } });
    }

    markOnline(robotId: string) {
        return this.prisma.robot.update({
            where: { id: robotId },
            data: { isOnline: true, lastSeen: new Date() },
        });
    }

    markOffline(robotId: string) {
        return this.prisma.robot.update({
            where: { id: robotId },
            data: { isOnline: false },
        });
    }

    updateTelemetry(robotId: string, telemetry: any) {
        return this.prisma.robot.update({
            where: { id: robotId },
            data: {
                battery: telemetry.battery,
                location: telemetry.location,
                lastSeen: new Date(),
            },
        });
    }
}
