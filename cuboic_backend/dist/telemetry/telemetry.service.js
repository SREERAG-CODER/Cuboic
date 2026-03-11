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
exports.TelemetryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TelemetryService = class TelemetryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getLatest(robotId) {
        return this.prisma.robotTelemetry.findFirst({
            where: { robotId },
            orderBy: { createdAt: 'desc' },
        });
    }
    getHistory(robotId, limit = 50) {
        return this.prisma.robotTelemetry.findMany({
            where: { robotId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async recordTelemetry(data) {
        return this.prisma.robotTelemetry.create({
            data: {
                robotId: data.robotId,
                battery: data.battery,
                location: data.location,
                status: (data.status ?? 'Idle'),
            },
        });
    }
};
exports.TelemetryService = TelemetryService;
exports.TelemetryService = TelemetryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TelemetryService);
//# sourceMappingURL=telemetry.service.js.map