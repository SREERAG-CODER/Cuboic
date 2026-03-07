import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    create(@Body() dto: CreateOrderDto) {
        return this.ordersService.create(dto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Owner')
    @Get()
    findAll(@Query('restaurantId') restaurantId: string, @Query('status') status?: string) {
        return this.ordersService.findAll(restaurantId, status);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Owner')
    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
        return this.ordersService.updateStatus(id, dto);
    }

    @Patch(':id/confirm')
    confirmDelivery(@Param('id') id: string) {
        return this.ordersService.confirmDelivery(id);
    }
}
