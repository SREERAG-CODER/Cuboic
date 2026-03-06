import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
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
        return this.menuService.getMenu(query.restaurant_id, query.table_id, query.category_id);
    }

    // Admin — fetch ALL items (including unavailable)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Owner')
    @Get('admin')
    getAdminMenu(@Query('restaurant_id') restaurantId: string) {
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
}
