import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findByPhone(phone: string): Promise<{
        customer: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
        } | null;
        phone: string;
    }>;
    register(body: {
        phone: string;
        name: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
    }>;
}
