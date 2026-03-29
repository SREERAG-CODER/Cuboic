import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const FEE_THRESHOLD = 100;
const FEE_AMOUNT = 5;

@Injectable()
export class PlatformFeesService {
    constructor(private prisma: PrismaService) { }

    /** Called after an order is created. Creates a ₹5 fee if total > ₹100. */
    async createIfEligible(restaurantId: string, orderId: string, orderTotal: number) {
        if (orderTotal <= FEE_THRESHOLD) return null;

        return this.prisma.platformFee.create({
            data: { restaurantId, orderId, amount: FEE_AMOUNT },
        });
    }

    findAll(restaurantId: string) {
        return this.prisma.platformFee.findMany({
            where: { restaurantId },
            include: { order: { select: { id: true, total: true, createdAt: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getSummary(restaurantId: string) {
        const fees = await this.prisma.platformFee.findMany({
            where: { restaurantId },
            select: { amount: true, isPaid: true },
        });

        const totalOwed = fees.filter(f => !f.isPaid).reduce((s, f) => s + f.amount, 0);
        const totalPaid = fees.filter(f => f.isPaid).reduce((s, f) => s + f.amount, 0);
        const unpaidCount = fees.filter(f => !f.isPaid).length;

        return { totalOwed, totalPaid, unpaidCount };
    }

    async markAsPaid(feeId: string) {
        return this.prisma.platformFee.update({
            where: { id: feeId },
            data: { isPaid: true },
        });
    }
}
