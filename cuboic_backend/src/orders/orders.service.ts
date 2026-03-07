import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';

const TAX_RATE = 0.05;

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private readonly eventsGateway: EventsGateway,
    ) { }

    async create(dto: CreateOrderDto) {
        const itemDocs = await this.prisma.menuItem.findMany({
            where: { id: { in: dto.items.map((i) => i.itemId) } },
        });

        if (itemDocs.length !== dto.items.length) {
            throw new BadRequestException('One or more menu items not found');
        }

        const orderItems = dto.items.map((i) => {
            const doc = itemDocs.find((d) => d.id === i.itemId);
            return { itemId: doc!.id, name: doc!.name, unitPrice: doc!.price, quantity: i.quantity };
        });

        const subtotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
        const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
        const total = parseFloat((subtotal + tax).toFixed(2));

        const order = await this.prisma.order.create({
            data: {
                restaurantId: dto.restaurantId,
                tableId: dto.tableId,
                customer_session_id: dto.customerSessionId,
                items: orderItems,
                subtotal,
                tax,
                total,
            },
        });

        this.eventsGateway.emitToRestaurant(dto.restaurantId, 'order:new', order);
        return order;
    }

    findOne(id: string) {
        return this.prisma.order.findUnique({ where: { id } });
    }

    findAll(restaurantId: string, status?: string) {
        return this.prisma.order.findMany({
            where: {
                restaurantId,
                ...(status ? { status: status as OrderStatus } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateStatus(id: string, dto: UpdateOrderStatusDto) {
        const order = await this.prisma.order.update({
            where: { id },
            data: { status: dto.status as OrderStatus },
        });
        if (!order) throw new NotFoundException('Order not found');
        this.eventsGateway.emitToRestaurant(order.restaurantId, 'order:updated', order);
        return order;
    }

    async confirmDelivery(id: string) {
        const order = await this.prisma.order.update({
            where: { id },
            data: { status: 'Delivered' },
        });
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }
}
