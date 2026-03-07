"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events/events.gateway");
let DeliveriesService = class DeliveriesService {
    prisma;
    eventsGateway;
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    async create(dto) {
        const robot = await this.prisma.robot.findUnique({ where: { id: dto.robot_id } });
        if (!robot)
            throw new common_1.NotFoundException('Robot not found');
        if (robot.status !== 'Idle')
            throw new common_1.BadRequestException('Robot is not idle');
        const allCabinets = dto.stops.flatMap((s) => s.cabinets);
        const unique = new Set(allCabinets);
        if (unique.size !== allCabinets.length)
            throw new common_1.ConflictException('Duplicate cabinet IDs');
        const cabinets = robot.cabinets;
        for (const cabId of allCabinets) {
            const cab = cabinets.find((c) => c.id === cabId);
            if (!cab)
                throw new common_1.BadRequestException(`Cabinet ${cabId} not found on robot`);
            if (cab.status === 'Occupied')
                throw new common_1.ConflictException(`Cabinet ${cabId} is occupied`);
        }
        const updatedCabinets = cabinets.map((cab) => ({
            ...cab,
            status: allCabinets.includes(cab.id) ? 'Occupied' : cab.status,
        }));
        await this.prisma.robot.update({
            where: { id: dto.robot_id },
            data: { status: 'Delivering', cabinets: updatedCabinets },
        });
        await this.prisma.order.updateMany({
            where: { id: { in: dto.stops.map((s) => s.order_id) } },
            data: { status: 'Assigned' },
        });
        const delivery = await this.prisma.delivery.create({
            data: {
                restaurantId: dto.restaurant_id,
                robotId: dto.robot_id,
                stops: dto.stops.map((s) => ({
                    order_id: s.order_id,
                    table_id: s.table_id,
                    cabinets: s.cabinets,
                    sequence: s.sequence,
                    status: 'Pending',
                })),
            },
        });
        this.eventsGateway.emitToRestaurant(dto.restaurant_id, 'delivery:started', delivery);
        return delivery;
    }
    findActive(restaurantId) {
        return this.prisma.delivery.findMany({
            where: { restaurantId, status: 'InTransit' },
        });
    }
    findAll(restaurantId) {
        return this.prisma.delivery.findMany({
            where: { restaurantId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async confirmStop(deliveryId, stopIndex) {
        const delivery = await this.prisma.delivery.findUnique({ where: { id: deliveryId } });
        if (!delivery)
            throw new common_1.NotFoundException('Delivery not found');
        const stops = delivery.stops;
        const stop = stops[stopIndex];
        if (!stop)
            throw new common_1.NotFoundException('Stop not found');
        if (stop.status === 'Delivered')
            throw new common_1.BadRequestException('Stop already confirmed');
        stops[stopIndex] = { ...stop, status: 'Delivered', delivered_at: new Date().toISOString() };
        await this.prisma.order.update({ where: { id: stop.order_id }, data: { status: 'Delivered' } });
        const robot = await this.prisma.robot.findUnique({ where: { id: delivery.robotId } });
        let robotUpdate = {};
        if (robot) {
            const cabs = robot.cabinets;
            const updatedCabs = cabs.map((c) => ({
                ...c,
                status: stop.cabinets.includes(c.id) ? 'Free' : c.status,
            }));
            robotUpdate.cabinets = updatedCabs;
        }
        const allDone = stops.every((s) => s.status === 'Delivered');
        const newDeliveryStatus = allDone ? 'Completed' : 'InTransit';
        if (allDone && robot)
            robotUpdate.status = 'Idle';
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
};
exports.DeliveriesService = DeliveriesService;
exports.DeliveriesService = DeliveriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], DeliveriesService);
//# sourceMappingURL=deliveries.service.js.map