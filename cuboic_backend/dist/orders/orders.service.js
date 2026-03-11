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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events/events.gateway");
const TAX_RATE = 0.05;
let OrdersService = class OrdersService {
    prisma;
    eventsGateway;
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    async create(dto) {
        console.log('[DEBUG] createOrder DTO:', JSON.stringify(dto, null, 2));
        const itemDocs = await this.prisma.menuItem.findMany({
            where: { id: { in: dto.items.map((i) => i.itemId) } },
        });
        if (itemDocs.length !== dto.items.length) {
            console.log('[DEBUG] itemDocs found:', itemDocs.map(d => d.id), 'but expected:', dto.items.map(i => i.itemId));
            throw new common_1.BadRequestException('One or more menu items not found');
        }
        const orderItems = dto.items.map((i) => {
            const doc = itemDocs.find((d) => d.id === i.itemId);
            return { itemId: doc.id, name: doc.name, unitPrice: doc.price, quantity: i.quantity };
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
    findOne(id) {
        return this.prisma.order.findUnique({
            where: { id },
            include: { table: true },
        });
    }
    findAll(restaurantId, status) {
        return this.prisma.order.findMany({
            where: {
                restaurantId,
                ...(status ? { status: status } : {}),
            },
            include: { table: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(id, dto) {
        const order = await this.prisma.order.update({
            where: { id },
            data: { status: dto.status },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        this.eventsGateway.emitToRestaurant(order.restaurantId, 'order:updated', order);
        return order;
    }
    async confirmDelivery(id) {
        const order = await this.prisma.order.update({
            where: { id },
            data: { status: 'Delivered' },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], OrdersService);
//# sourceMappingURL=orders.service.js.map