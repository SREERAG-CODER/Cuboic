import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { QueryMenuDto } from './dto/query-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) { }

    // Public — customer-facing (no auth)
    @Get()
    getMenu(@Query() query: QueryMenuDto) {
        return this.menuService.getMenu(query.restaurantId, query.tableId, query.categoryId);
    }

    // Admin — fetch ALL items (including unavailable)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Owner')
    @Get('admin')
    getAdminMenu(@Query('restaurantId') restaurantId: string) {
        return this.menuService.getAllForAdmin(restaurantId);
    }

    // Admin — create a new menu item
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Owner')
    @Post()
    createItem(@Body() dto: CreateMenuItemDto) {
        return this.menuService.createItem(dto);
    }

    // Admin — update an existing menu item (price, availability, etc.)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Owner')
    @Put(':id')
    updateItem(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
        return this.menuService.updateItem(id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Owner')
    @Patch('bulk')
    bulkUpdate(@Query('restaurantId') restaurantId: string, @Body() body: Array<{ id: string; data: Partial<UpdateMenuItemDto> }>) {
        return this.menuService.bulkUpdate(restaurantId, body);
    }
}
