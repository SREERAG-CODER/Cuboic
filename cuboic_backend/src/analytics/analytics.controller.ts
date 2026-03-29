import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(':restaurantId/revenue')
  @Roles(UserRole.Owner, UserRole.Admin)
  getRevenueTrends(
    @Param('restaurantId') restaurantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('timeframe') timeframe?: 'daily' | 'weekly' | 'monthly',
  ) {
    return this.analyticsService.getRevenueTrends(restaurantId, startDate, endDate, timeframe);
  }

  @Get(':restaurantId/menu')
  @Roles(UserRole.Owner, UserRole.Admin)
  getMenuAnalytics(
    @Param('restaurantId') restaurantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getMenuAnalytics(restaurantId, startDate, endDate);
  }

  @Get(':restaurantId/customers')
  @Roles(UserRole.Owner, UserRole.Admin)
  getCustomerInsights(
    @Param('restaurantId') restaurantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getCustomerInsights(restaurantId, startDate, endDate);
  }
}
