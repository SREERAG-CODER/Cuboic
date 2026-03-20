import { Controller, Post, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Post('verify-firebase-token')
    verifyFirebaseToken(@Body() body: { idToken: string }) {
        return this.customersService.verifyFirebaseToken(body.idToken);
    }

    @Post('register')
    register(@Body() body: { phone: string; name: string }) {
        return this.customersService.register(body.phone, body.name);
    }
}
