import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class CustomersService {
    private twilioClient: Twilio | null = null;
    private twilioPhone: string;
    
    // In-memory OTP store: phone -> { otp, expiresAt }
    private otps = new Map<string, { otp: string, expiresAt: number }>();

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
    ) {
        // Use ConfigService to auto-strip any accidental quotes from the .env file
        const sid = this.configService.get<string>('TWILIO_ACCOUNT_SID')?.replace(/"/g, '');
        const auth = this.configService.get<string>('TWILIO_AUTH_TOKEN')?.replace(/"/g, '');
        this.twilioPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER')?.replace(/"/g, '') || '';
        
        if (sid && auth) {
            this.twilioClient = new Twilio(sid, auth);
            console.log("Twilio initialized successfully on backend!");
        } else {
            console.log("Twilio keys not found or invalid.");
        }
    }

    async sendOtp(phone: string) {
        // Generate a 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Store it for 5 minutes
        this.otps.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

        if (this.twilioClient && this.twilioPhone) {
            try {
                // Twilio strictly requires E.164 format (e.g. +91 for India)
                let formattedPhone = phone.trim();
                if (formattedPhone.length === 10 && !formattedPhone.startsWith('+')) {
                    formattedPhone = '+91' + formattedPhone;
                }

                await this.twilioClient.messages.create({
                    body: `Your Thambi verification code is: ${otp}`,
                    from: this.twilioPhone,
                    to: formattedPhone
                });
            } catch (err: any) {
                console.error("Twilio error:", err?.message || err);
                console.log(`[DEVELOPMENT] OTP for ${phone} is ${otp}`);
            }
        } else {
            console.log(`[DEVELOPMENT] Twilio not configured. OTP for ${phone} is ${otp}`);
        }
        
        return { success: true, message: 'OTP sent successfully' };
    }

    async verifyOtp(phone: string, otp: string) {
        const record = this.otps.get(phone);
        if (!record) {
            throw new BadRequestException('No OTP found or expired');
        }
        if (Date.now() > record.expiresAt) {
            this.otps.delete(phone);
            throw new BadRequestException('OTP expired');
        }
        if (record.otp !== otp) {
            throw new BadRequestException('Invalid OTP');
        }
        
        // Clear OTP
        this.otps.delete(phone);
        
        // Check if customer exists
        const customer = await this.prisma.customer.findUnique({
            where: { phone }
        });
        
        return {
            verified: true,
            customer: customer || null,
            phone: phone
        };
    }

    async register(phone: string, name: string) {
        let customer = await this.prisma.customer.findUnique({ where: { phone } });
        if (!customer) {
            customer = await this.prisma.customer.create({
                data: { phone, name }
            });
        }
        return customer;
    }
}
