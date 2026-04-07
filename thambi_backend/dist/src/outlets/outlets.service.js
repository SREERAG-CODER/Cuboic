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
exports.OutletsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OutletsService = class OutletsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(dto) {
        return this.prisma.outlet.create({ data: dto });
    }
    findAll(restaurantId) {
        return this.prisma.outlet.findMany({
            where: { restaurantId },
            include: { _count: { select: { inventoryItems: true, orders: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
    async findOne(id) {
        const outlet = await this.prisma.outlet.findUnique({
            where: { id },
            include: { restaurant: true },
        });
        if (!outlet)
            throw new common_1.NotFoundException('Outlet not found');
        return outlet;
    }
    async update(id, data) {
        const outlet = await this.prisma.outlet.findUnique({ where: { id } });
        if (!outlet)
            throw new common_1.NotFoundException('Outlet not found');
        return this.prisma.outlet.update({ where: { id }, data });
    }
};
exports.OutletsService = OutletsService;
exports.OutletsService = OutletsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OutletsService);
//# sourceMappingURL=outlets.service.js.map