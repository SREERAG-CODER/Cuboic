import { Controller, Get, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('stats')
    getStats() {
        return this.adminService.getStats();
    }

    @Get('restaurants')
    getRestaurants() {
        return this.adminService.getRestaurants();
    }

    @Get('robots')
    getRobots() {
        return this.adminService.getRobots();
    }

    @Get('alerts')
    getAlerts(@Query('limit') limit?: string) {
        return this.adminService.getAlerts(limit ? parseInt(limit) : 50);
    }

    @Patch('alerts/:id/resolve')
    resolveAlert(@Param('id') id: string) {
        return this.adminService.resolveAlert(id);
    }
}
