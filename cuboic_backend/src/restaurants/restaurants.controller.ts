import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) { }

  // GET /restaurants
  @Get()
  async getAll() {
    return this.restaurantsService.findAll();
  }

  // GET /restaurants/:id
  @Get(':id')
  async getById(@Param('id') id: string) {
    const restaurant = await this.restaurantsService.findById(id);

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  // POST /restaurants
  @Post()
  async create(@Body() body: any) {
    console.log("BODY:", body);
    return this.restaurantsService.create(body);
  }
}