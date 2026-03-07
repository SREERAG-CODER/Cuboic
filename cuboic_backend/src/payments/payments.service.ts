import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService) { }

    findAll(restaurantId: string, from?: string, to?: string) {
        return this.prisma.payment.findMany({
            where: {
                order: { restaurantId },
                ...(from || to
                    ? {
                        createdAt: {
                            ...(from ? { gte: new Date(from) } : {}),
                            ...(to ? { lte: new Date(to) } : {}),
                        },
                    }
                    : {}),
            },
            orderBy: { createdAt: 'desc' },
            include: { order: true },
        });
    }

    async getSummary(restaurantId: string) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const todayPayments = await this.prisma.payment.findMany({
            where: {
                order: { restaurantId },
                status: 'Paid',
                createdAt: { gte: start, lte: end },
            },
        });

        const total_revenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);
        return { order_count: todayPayments.length, total_revenue };
    }
}
