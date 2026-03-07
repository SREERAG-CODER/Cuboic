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
    getById(id: string): Promise<{
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
