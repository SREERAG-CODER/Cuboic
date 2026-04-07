"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const menu_module_1 = require("./menu/menu.module");
const categories_module_1 = require("./categories/categories.module");
const orders_module_1 = require("./orders/orders.module");
const robots_module_1 = require("./robots/robots.module");
const deliveries_module_1 = require("./deliveries/deliveries.module");
const payments_module_1 = require("./payments/payments.module");
const users_module_1 = require("./users/users.module");
const telemetry_module_1 = require("./telemetry/telemetry.module");
const auth_module_1 = require("./auth/auth.module");
const events_module_1 = require("./events/events.module");
const restaurants_module_1 = require("./restaurants/restaurants.module");
const robot_runtime_module_1 = require("./robot-runtime/robot-runtime.module");
const health_module_1 = require("./health/health.module");
const schedule_1 = require("@nestjs/schedule");
const tables_module_1 = require("./tables/tables.module");
const customers_module_1 = require("./customers/customers.module");
const platform_fees_module_1 = require("./platform-fees/platform-fees.module");
const analytics_module_1 = require("./analytics/analytics.module");
const outlets_module_1 = require("./outlets/outlets.module");
const inventory_module_1 = require("./inventory/inventory.module");
const recipes_module_1 = require("./recipes/recipes.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            prisma_module_1.PrismaModule,
            menu_module_1.MenuModule,
            categories_module_1.CategoriesModule,
            orders_module_1.OrdersModule,
            robots_module_1.RobotsModule,
            deliveries_module_1.DeliveriesModule,
            payments_module_1.PaymentsModule,
            users_module_1.UsersModule,
            telemetry_module_1.TelemetryModule,
            auth_module_1.AuthModule,
            events_module_1.EventsModule,
            restaurants_module_1.RestaurantsModule,
            robot_runtime_module_1.RobotRuntimeModule,
            health_module_1.HealthModule,
            schedule_1.ScheduleModule.forRoot(),
            tables_module_1.TablesModule,
            customers_module_1.CustomersModule,
            platform_fees_module_1.PlatformFeesModule,
            analytics_module_1.AnalyticsModule,
            outlets_module_1.OutletsModule,
            inventory_module_1.InventoryModule,
            recipes_module_1.RecipesModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map