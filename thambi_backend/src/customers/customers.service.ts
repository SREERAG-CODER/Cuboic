import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async findByPhone(phone: string) {
        const localPhone = phone.replace(/^\+91/, '');
        const customer = await this.prisma.customer.findUnique({
            where: { phone: localPhone },
        });
        return { customer: customer || null, phone: localPhone };
    }

    async findAll() {
        return this.prisma.customer.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async register(phone: string, name: string) {
        const localPhone = phone.replace(/^\+91/, '');
        let customer = await this.prisma.customer.findUnique({
            where: { phone: localPhone },
        });

        if (!customer) {
            customer = await this.prisma.customer.create({
                data: { phone: localPhone, name },
            });
        }

        return customer;
    }
}