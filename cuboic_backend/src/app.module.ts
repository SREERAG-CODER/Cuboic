import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MenuModule } from './menu/menu.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { RobotsModule } from './robots/robots.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { RobotRuntimeModule } from './robot-runtime/robot-runtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MenuModule,
    CategoriesModule,
    OrdersModule,
    RobotsModule,
    DeliveriesModule,
    PaymentsModule,
    UsersModule,
    TelemetryModule,
    AuthModule,
    EventsModule,
    RestaurantsModule,
    RobotRuntimeModule,
  ],
})
export class AppModule { }
