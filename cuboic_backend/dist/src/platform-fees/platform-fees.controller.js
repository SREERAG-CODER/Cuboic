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
exports.PlatformFeesController = void 0;
const common_1 = require("@nestjs/common");
const platform_fees_service_1 = require("./platform-fees.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let PlatformFeesController = class PlatformFeesController {
    platformFeesService;
    constructor(platformFeesService) {
        this.platformFeesService = platformFeesService;
    }
    findAll(restaurantId) {
        return this.platformFeesService.findAll(restaurantId);
    }
    getSummary(restaurantId) {
        return this.platformFeesService.getSummary(restaurantId);
    }
    markAsPaid(id) {
        return this.platformFeesService.markAsPaid(id);
    }
};
exports.PlatformFeesController = PlatformFeesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformFeesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformFeesController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Patch)(':id/pay'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformFeesController.prototype, "markAsPaid", null);
exports.PlatformFeesController = PlatformFeesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Owner'),
    (0, common_1.Controller)('platform-fees'),
    __metadata("design:paramtypes", [platform_fees_service_1.PlatformFeesService])
], PlatformFeesController);
//# sourceMappingURL=platform-fees.controller.js.map