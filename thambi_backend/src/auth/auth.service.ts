import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(userId: string, password: string) {
        const user = await this.usersService.findByUserId(userId);
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;
        return user;
    }

    login(user: any) {
        const payload = {
            sub: user.id,
            userId: user.user_id,
            role: user.role,
            restaurantId: user.restaurantId,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                userId: user.user_id,
                role: user.role,
                restaurantId: user.restaurantId,
                email: user.email ?? null,
                phone: user.phone ?? null,
            },
        };
    }

    async changePassword(userId: string, oldPass: string, newPass: string) {
        const valid = await this.validateUser(userId, oldPass);
        if (!valid) throw new UnauthorizedException('Invalid old password');
        const hash = await bcrypt.hash(newPass, 10);
        return this.usersService.updatePassword(valid.id, hash);
    }
}
