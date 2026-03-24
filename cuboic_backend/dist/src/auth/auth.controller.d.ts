import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: any): {
        access_token: string;
        user: {
            id: any;
            name: any;
            userId: any;
            role: any;
            restaurantId: any;
        };
    };
    me(req: any): any;
    changePassword(req: any, body: any): Promise<{
        id: string;
        name: string;
        user_id: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
}
