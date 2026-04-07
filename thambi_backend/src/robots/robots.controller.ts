import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RobotsService } from './robots.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Staff', 'Owner')
@Controller('robots')
export class RobotsController {
    constructor(private readonly robotsService: RobotsService) { }

    @Get()
    findAll(@Query('restaurantId') restaurantId: string) {
        return this.robotsService.findAll(restaurantId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.robotsService.findOne(id);
    }
}
