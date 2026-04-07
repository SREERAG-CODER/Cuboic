import { Controller, Post, Patch, Body, Param } from '@nestjs/common';
import { TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
    constructor(private readonly tablesService: TablesService) {}

    @Post()
    create(@Body() body: { restaurantId: string; table_number: string }) {
        return this.tablesService.create(body.restaurantId, body.table_number);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: { is_active: boolean }) {
        return this.tablesService.updateStatus(id, body.is_active);
    }
}
