import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { UpsertRecipeDto } from './dto/upsert-recipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  findAll() {
    return this.recipesService.findAll();
  }

  @Get('menu-item/:menuItemId')
  findByMenuItem(@Param('menuItemId') menuItemId: string) {
    return this.recipesService.findByMenuItem(menuItemId);
  }

  @Post()
  upsert(@Body() dto: UpsertRecipeDto) {
    return this.recipesService.upsert(dto);
  }

  @Put('menu-item/:menuItemId')
  update(@Param('menuItemId') menuItemId: string, @Body() dto: UpsertRecipeDto) {
    return this.recipesService.upsert({ ...dto, menuItemId });
  }

  @Delete('menu-item/:menuItemId')
  remove(@Param('menuItemId') menuItemId: string) {
    return this.recipesService.remove(menuItemId);
  }
}
