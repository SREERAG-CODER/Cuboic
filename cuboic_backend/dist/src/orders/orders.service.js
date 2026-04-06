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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events/events.gateway");
const platform_fees_service_1 = require("../platform-fees/platform-fees.service");
const inventory_service_1 = require("../inventory/inventory.service");
let OrdersService = OrdersService_1 = class OrdersService {
    prisma;
    eventsGateway;
    platformFeesService;
    inventoryService;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(prisma, eventsGateway, platformFeesService, inventoryService) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
        this.platformFeesService = platformFeesService;
        this.inventoryService = inventoryService;
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
        const tax = 0;
        const total = parseFloat((subtotal + tax).toFixed(2));
        const order = await this.prisma.order.create({
            data: {
                restaurantId: dto.restaurantId,
                tableId: dto.tableId,
                customerId: dto.customerId,
                customer_session_id: dto.customerSessionId,
                notes: dto.notes,
                items: orderItems,
                subtotal,
                tax,
                total,
                payment: {
                    create: {
                        amount: total,
                        method: 'Counter',
                        status: 'Pending',
                        transaction_id: `txn_${Date.now()}`
                    }
                }
            },
            include: { payment: true, customer: true, table: true }
        });
        this.eventsGateway.emitToRestaurant(dto.restaurantId, 'order:new', order);
        await this.platformFeesService.createIfEligible(dto.restaurantId, order.id, total);
        if (dto.outletId) {
            try {
                await this.inventoryService.deductForOrder(dto.outletId, order.id, dto.items.map((i) => ({ itemId: i.itemId, quantity: i.quantity })));
            }
            catch (e) {
                this.logger.warn(`Inventory deduction failed for order ${order.id}: ${e.message}`);
            }
        }
        return order;
    }
    findOne(id) {
        return this.prisma.order.findUnique({
            where: { id },
            include: { table: true, payment: true, customer: true },
        });
    }
    findAll(restaurantId, status) {
        return this.prisma.order.findMany({
            where: {
                restaurantId,
                ...(status ? { status: status } : {}),
            },
            include: { table: true, payment: true, customer: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getSummary(restaurantId) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const todayOrders = await this.prisma.order.findMany({
            where: {
                restaurantId,
                createdAt: { gte: start, lte: end },
            },
            select: { status: true },
        });
        const summary = todayOrders.reduce((acc, order) => {
            if (order.status === 'Pending')
                acc.pending++;
            if (order.status === 'Confirmed' || order.status === 'Preparing')
                acc.preparing++;
            if (order.status === 'Delivered')
                acc.completed++;
            return acc;
        }, { pending: 0, preparing: 0, completed: 0 });
        return summary;
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
    async updateTable(id, tableId) {
        const order = await this.prisma.order.update({
            where: { id },
            data: { tableId },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        this.eventsGateway.emitToRestaurant(order.restaurantId, 'order:updated', order);
        return order;
    }
    async cancelOrder(id) {
        const existing = await this.prisma.order.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Order not found');
        const cancellableStates = ['Pending', 'Confirmed', 'Preparing'];
        if (!cancellableStates.includes(existing.status)) {
            throw new common_1.BadRequestException(`Order cannot be cancelled in state: ${existing.status}`);
        }
        const order = await this.prisma.order.update({
            where: { id },
            data: { status: 'Cancelled' },
        });
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
    async markAsPaid(id) {
        const order = await this.prisma.order.update({
            where: { id },
            data: {
                payment: {
                    update: { status: 'Paid' }
                }
            },
            include: { payment: true, table: true }
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        this.eventsGateway.emitToRestaurant(order.restaurantId, 'order:updated', order);
        return order;
    }
    async cleanupStaleOrders() {
        this.logger.log('Running stale orders cleanup...');
        const cutoff = new Date(Date.now() - 8 * 60 * 60 * 1000);
        try {
            const staleOrders = await this.prisma.order.findMany({
                where: {
                    status: 'Pending',
                    createdAt: { lt: cutoff },
                },
                select: { id: true },
            });
            if (staleOrders.length === 0) {
                this.logger.log('No stale orders to clean up.');
                return;
            }
            const orderIds = staleOrders.map(o => o.id);
            await this.prisma.payment.deleteMany({
                where: { orderId: { in: orderIds } },
            });
            const deleted = await this.prisma.order.deleteMany({
                where: { id: { in: orderIds } },
            });
            this.logger.log(`Cleanup complete: Deleted ${deleted.count} stale pending order(s).`);
        }
        catch (error) {
            this.logger.error('Error during stale orders cleanup:', error);
        }
    }
};
exports.OrdersService = OrdersService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersService.prototype, "cleanupStaleOrders", null);
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway,
        platform_fees_service_1.PlatformFeesService,
        inventory_service_1.InventoryService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map