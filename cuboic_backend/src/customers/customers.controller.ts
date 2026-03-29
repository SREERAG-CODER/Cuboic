import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Get('lookup')
    findByPhone(@Query('phone') phone: string) {
        return this.customersService.findByPhone(phone);
    }

    @Post('register')
    register(@Body() body: { phone: string; name: string }) {
        return this.customersService.register(body.phone, body.name);
    }
}
