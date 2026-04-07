import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { CreateDeliveryDto } from './dto/create-delivery.dto';

@Injectable()
export class DeliveriesService {
    constructor(
        private prisma: PrismaService,
        private readonly eventsGateway: EventsGateway,
    ) { }

    async create(dto: CreateDeliveryDto) {
        const robot = await this.prisma.robot.findUnique({ where: { id: dto.robotId } });
        if (!robot) throw new NotFoundException('Robot not found');
        if (robot.status !== 'Idle') throw new BadRequestException('Robot is not idle');

        const allCabinets = dto.stops.flatMap((s) => s.cabinets);
        const unique = new Set(allCabinets);
        if (unique.size !== allCabinets.length) throw new ConflictException('Duplicate cabinet IDs');

        const cabinets = robot.cabinets as Array<{ id: string; status: string }>;
        for (const cabId of allCabinets) {
            const cab = cabinets.find((c) => c.id === cabId);
            if (!cab) throw new BadRequestException(`Cabinet ${cabId} not found on robot`);
            if (cab.status === 'Occupied') throw new ConflictException(`Cabinet ${cabId} is occupied`);
        }

        // Mark cabinets occupied on robot
        const updatedCabinets = cabinets.map((cab) => ({
            ...cab,
            status: allCabinets.includes(cab.id) ? 'Occupied' : cab.status,
        }));
        await this.prisma.robot.update({
            where: { id: dto.robotId },
            data: { status: 'Delivering', cabinets: updatedCabinets },
        });

        // Update orders to Assigned
        await this.prisma.order.updateMany({
            where: { id: { in: dto.stops.map((s) => s.orderId) } },
            data: { status: 'Assigned' },
        });

        const delivery = await this.prisma.delivery.create({
            data: {
                restaurantId: dto.restaurantId,
                robotId: dto.robotId,
                stops: dto.stops.map((s) => ({
                    orderId: s.orderId,
                    tableId: s.tableId,
                    cabinets: s.cabinets,
                    sequence: s.sequence,
                    status: 'Pending',
                })),
            },
        });

        this.eventsGateway.emitToRestaurant(dto.restaurantId, 'delivery:started', delivery);
        return delivery;
    }

    findActive(restaurantId: string) {
        return this.prisma.delivery.findMany({
            where: { restaurantId, status: 'InTransit' },
        });
    }

    findAll(restaurantId: string) {
        return this.prisma.delivery.findMany({
            where: { restaurantId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async confirmStop(deliveryId: string, stopIndex: number) {
        const delivery = await this.prisma.delivery.findUnique({ where: { id: deliveryId } });
        if (!delivery) throw new NotFoundException('Delivery not found');

        const stops = delivery.stops as Array<{
            orderId: string; tableId: string; cabinets: string[];
            sequence: number; status: string; delivered_at?: string;
        }>;

        const stop = stops[stopIndex];
        if (!stop) throw new NotFoundException('Stop not found');
        if (stop.status === 'Delivered') throw new BadRequestException('Stop already confirmed');

        stops[stopIndex] = { ...stop, status: 'Delivered', delivered_at: new Date().toISOString() };
        await this.prisma.order.update({ where: { id: stop.orderId }, data: { status: 'Delivered' } });

        const robot = await this.prisma.robot.findUnique({ where: { id: delivery.robotId } });
        let robotUpdate: any = {};
        if (robot) {
            const cabs = robot.cabinets as Array<{ id: string; status: string }>;
            const updatedCabs = cabs.map((c) => ({
                ...c,
                status: stop.cabinets.includes(c.id) ? 'Free' : c.status,
            }));
            robotUpdate.cabinets = updatedCabs;
        }

        const allDone = stops.every((s) => s.status === 'Delivered');
        const newDeliveryStatus = allDone ? 'Completed' : 'InTransit';
        if (allDone && robot) robotUpdate.status = 'Idle';

        if (robot && Object.keys(robotUpdate).length > 0) {
            await this.prisma.robot.update({ where: { id: delivery.robotId }, data: robotUpdate });
        }

        const updated = await this.prisma.delivery.update({
            where: { id: deliveryId },
            data: { stops, status: newDeliveryStatus },
        });

        this.eventsGateway.emitToRestaurant(delivery.restaurantId, 'delivery:updated', updated);
        return updated;
    }
}
