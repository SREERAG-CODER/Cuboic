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
exports.PlatformFeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const FEE_THRESHOLD = 100;
const FEE_AMOUNT = 5;
let PlatformFeesService = class PlatformFeesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createIfEligible(restaurantId, orderId, orderTotal) {
        if (orderTotal <= FEE_THRESHOLD)
            return null;
        return this.prisma.platformFee.create({
            data: { restaurantId, orderId, amount: FEE_AMOUNT },
        });
    }
    findAll(restaurantId) {
        return this.prisma.platformFee.findMany({
            where: { restaurantId },
            include: { order: { select: { id: true, total: true, createdAt: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getSummary(restaurantId) {
        const fees = await this.prisma.platformFee.findMany({
            where: { restaurantId },
            select: { amount: true, isPaid: true },
        });
        const totalOwed = fees.filter(f => !f.isPaid).reduce((s, f) => s + f.amount, 0);
        const totalPaid = fees.filter(f => f.isPaid).reduce((s, f) => s + f.amount, 0);
        const unpaidCount = fees.filter(f => !f.isPaid).length;
        return { totalOwed, totalPaid, unpaidCount };
    }
    async markAsPaid(feeId) {
        return this.prisma.platformFee.update({
            where: { id: feeId },
            data: { isPaid: true },
        });
    }
};
exports.PlatformFeesService = PlatformFeesService;
exports.PlatformFeesService = PlatformFeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlatformFeesService);
//# sourceMappingURL=platform-fees.service.js.map