import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { StockInDto, StockAdjustDto } from './dto/stock-operations.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ── Items ────────────────────────────────────────────────────────────────
  @Post('items')
  create(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.create(dto);
  }

  @Get('items')
  findAll(@Query('outletId') outletId: string) {
    return this.inventoryService.findAll(outletId);
  }

  @Get('items/low-stock')
  findLowStock(@Query('outletId') outletId: string) {
    return this.inventoryService.findLowStock(outletId);
  }

  @Get('items/:id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch('items/:id')
  update(@Param('id') id: string, @Body() body: Partial<CreateInventoryItemDto>) {
    return this.inventoryService.update(id, body);
  }

  @Delete('items/:id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }

  // ── Stock Operations ─────────────────────────────────────────────────────
  @Post('items/:id/stock-in')
  stockIn(@Param('id') id: string, @Body() dto: StockInDto) {
    return this.inventoryService.stockIn(id, dto);
  }

  @Post('items/:id/adjust')
  adjust(@Param('id') id: string, @Body() dto: StockAdjustDto) {
    return this.inventoryService.adjust(id, dto);
  }

  // ── Availability Check ───────────────────────────────────────────────────
  @Post('check-availability')
  checkAvailability(
    @Body() body: { outletId: string; items: Array<{ itemId: string; quantity: number }> },
  ) {
    return this.inventoryService.checkAvailability(body.outletId, body.items);
  }
}
