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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveriesController = void 0;
const common_1 = require("@nestjs/common");
const deliveries_service_1 = require("./deliveries.service");
const create_delivery_dto_1 = require("./dto/create-delivery.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let DeliveriesController = class DeliveriesController {
    deliveriesService;
    constructor(deliveriesService) {
        this.deliveriesService = deliveriesService;
    }
    create(dto) {
        return this.deliveriesService.create(dto);
    }
    findActive(restaurantId) {
        return this.deliveriesService.findActive(restaurantId);
    }
    findAll(restaurantId) {
        return this.deliveriesService.findAll(restaurantId);
    }
    confirmStop(id, index) {
        return this.deliveriesService.confirmStop(id, parseInt(index, 10));
    }
};
exports.DeliveriesController = DeliveriesController;
__decorate([
    (0, roles_decorator_1.Roles)('Staff'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_delivery_dto_1.CreateDeliveryDto]),
    __metadata("design:returntype", void 0)
], DeliveriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Query)('restaurant_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeliveriesController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('restaurant_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeliveriesController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('Staff'),
    (0, common_1.Patch)(':id/stops/:index/confirm'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('index')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DeliveriesController.prototype, "confirmStop", null);
exports.DeliveriesController = DeliveriesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Staff', 'Owner'),
    (0, common_1.Controller)('deliveries'),
    __metadata("design:paramtypes", [deliveries_service_1.DeliveriesService])
], DeliveriesController);
//# sourceMappingURL=deliveries.controller.js.map