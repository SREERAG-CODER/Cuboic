import { Controller, Post, Patch, Get, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(@Request() req: any) {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Request() req: any) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    changePassword(@Request() req: any, @Body() body: any) {
        return this.authService.changePassword(req.user.userId, body.oldPassword, body.newPassword);
    }
}
