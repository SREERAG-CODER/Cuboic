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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    getRevenueTrends(restaurantId, startDate, endDate, timeframe) {
        return this.analyticsService.getRevenueTrends(restaurantId, startDate, endDate, timeframe);
    }
    getMenuAnalytics(restaurantId, startDate, endDate) {
        return this.analyticsService.getMenuAnalytics(restaurantId, startDate, endDate);
    }
    getCustomerInsights(restaurantId, startDate, endDate) {
        return this.analyticsService.getCustomerInsights(restaurantId, startDate, endDate);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)(':restaurantId/revenue'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.Owner, client_1.UserRole.Admin),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('timeframe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getRevenueTrends", null);
__decorate([
    (0, common_1.Get)(':restaurantId/menu'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.Owner, client_1.UserRole.Admin),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getMenuAnalytics", null);
__decorate([
    (0, common_1.Get)(':restaurantId/customers'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.Owner, client_1.UserRole.Admin),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getCustomerInsights", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map