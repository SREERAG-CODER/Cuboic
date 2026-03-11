import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Staff', 'Owner')
@Controller('deliveries')
export class DeliveriesController {
    constructor(private readonly deliveriesService: DeliveriesService) { }

    @Roles('Staff')
    @Post()
    create(@Body() dto: CreateDeliveryDto) {
        return this.deliveriesService.create(dto);
    }

    @Get('active')
    findActive(@Query('restaurantId') restaurantId: string) {
        return this.deliveriesService.findActive(restaurantId);
    }

    @Get()
    findAll(@Query('restaurantId') restaurantId: string) {
        return this.deliveriesService.findAll(restaurantId);
    }

    @Roles('Staff')
    @Patch(':id/stops/:index/confirm')
    confirmStop(@Param('id') id: string, @Param('index') index: string) {
        return this.deliveriesService.confirmStop(id, parseInt(index, 10));
    }
}
