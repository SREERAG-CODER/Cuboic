import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Owner')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get()
    findAll(
        @Query('restaurantId') restaurantId: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.paymentsService.findAll(restaurantId, from, to);
    }

    @Get('summary')
    getSummary(@Query('restaurantId') restaurantId: string) {
        return this.paymentsService.getSummary(restaurantId);
    }
}
