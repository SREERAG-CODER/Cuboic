import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const [restaurants, orders, robots, users] = await Promise.all([
            this.prisma.restaurant.count({ where: { is_active: true } }),
            this.prisma.order.count(),
            this.prisma.robot.count(),
            this.prisma.user.count({ where: { role: 'Owner' } }),
        ]);

        const revenue = await this.prisma.payment.aggregate({
            where: { status: 'Paid' },
            _sum: { amount: true },
        });

        return {
            restaurants,
            orders,
            robots,
            owners: users,
            totalRevenue: revenue._sum.amount || 0,
        };
    }

    async getRestaurants() {
        return this.prisma.restaurant.findMany({
            include: {
                _count: {
                    select: { orders: true, robots: true, users: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getRobots() {
        return this.prisma.robot.findMany({
            include: {
                restaurant: {
                    select: { name: true }
                }
            }
        });
    }

    async getAlerts(limit = 50) {
        return this.prisma.systemAlert.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                restaurant: {
                    select: { name: true }
                }
            }
        });
    }

    async resolveAlert(id: string) {
        return this.prisma.systemAlert.update({
            where: { id },
            data: { isResolved: true }
        });
    }

    async createAlert(data: {
        severity: 'INFO' | 'WARNING' | 'CRITICAL';
        source: string;
        message: string;
        details?: any;
        restaurantId?: string;
        robotId?: string;
    }) {
        return this.prisma.systemAlert.create({
            data: {
                severity: data.severity,
                source: data.source,
                message: data.message,
                details: data.details || {},
                restaurantId: data.restaurantId || null,
                robotId: data.robotId || null,
            }
        });
    }
}
