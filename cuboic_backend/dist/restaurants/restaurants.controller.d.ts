import { RestaurantsService } from './restaurants.service';
export declare class RestaurantsController {
    private readonly restaurantsService;
    constructor(restaurantsService: RestaurantsService);
    getAll(): Promise<{
        name: string;
        description: string | null;
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        logo_url: string | null;
    }[]>;
    getById(id: string): Promise<{
        tables: {
            restaurantId: string;
            id: string;
            table_number: string;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        name: string;
        description: string | null;
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        logo_url: string | null;
    }>;
    create(body: any): Promise<{
        name: string;
        description: string | null;
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        logo_url: string | null;
    }>;
}
