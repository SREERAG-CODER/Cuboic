import { PrismaService } from '../prisma/prisma.service';
import { CreateOutletDto } from './dto/create-outlet.dto';
export declare class OutletsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateOutletDto): import("@prisma/client").Prisma.Prisma__OutletClient<{
        id: string;
        name: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        address: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            orders: number;
            inventoryItems: number;
        };
    } & {
        id: string;
        name: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        address: string | null;
    })[]>;
    findOne(id: string): Promise<{
        restaurant: {
            id: string;
            name: string;
            description: string | null;
            logo_url: string | null;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        name: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        address: string | null;
    }>;
    update(id: string, data: Partial<CreateOutletDto>): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        address: string | null;
    }>;
}
