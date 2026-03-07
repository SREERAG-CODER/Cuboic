import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        restaurantId: string;
        name: string;
        display_order: number;
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
