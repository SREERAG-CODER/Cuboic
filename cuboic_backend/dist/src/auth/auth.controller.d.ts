import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: any): {
        access_token: string;
        user: {
            id: any;
            name: any;
            user_id: any;
            role: any;
            restaurant_id: any;
        };
    };
    me(req: any): any;
}
