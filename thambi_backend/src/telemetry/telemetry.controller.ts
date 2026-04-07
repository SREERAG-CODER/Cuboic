import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Staff', 'Owner')
@Controller('telemetry')
export class TelemetryController {
    constructor(private readonly telemetryService: TelemetryService) { }

    @Get(':robotId/latest')
    getLatest(@Param('robotId') robotId: string) {
        return this.telemetryService.getLatest(robotId);
    }

    @Get(':robotId/history')
    getHistory(@Param('robotId') robotId: string, @Query('limit') limit?: string) {
        return this.telemetryService.getHistory(robotId, limit ? parseInt(limit, 10) : 50);
    }
}
