import { RestaurantsService } from './restaurants.service';
export declare class RestaurantsController {
    private readonly restaurantsService;
    constructor(restaurantsService: RestaurantsService);
    getAll(): Promise<{
        id: string;
        name: string;
        description: string | null;
        logo_url: string | null;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getTables(id: string): Promise<{
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        table_number: string;
        restaurantId: string;
    }[]>;
    getById(id: string): Promise<{
        tables: {
            id: string;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
            table_number: string;
            restaurantId: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        logo_url: string | null;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(body: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        logo_url: string | null;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
