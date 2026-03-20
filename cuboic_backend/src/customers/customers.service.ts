import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class CustomersService implements OnModuleInit {

    constructor(private prisma: PrismaService) {}

    onModuleInit() {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
            console.log('[Firebase Admin] Initialized successfully.');
        }
    }

    async verifyFirebaseToken(idToken: string) {
        let decodedToken: admin.auth.DecodedIdToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (err: any) {
            throw new BadRequestException('Invalid or expired Firebase token.');
        }

        const phone = decodedToken.phone_number;
        if (!phone) {
            throw new BadRequestException('No phone number associated with this token.');
        }

        console.log(`[Firebase Admin] Token verified for ${phone}`);

        // Strip country code for storage (keep consistent with existing DB records)
        const localPhone = phone.replace(/^\+91/, '');

        const customer = await this.prisma.customer.findUnique({
            where: { phone: localPhone },
        });

        return {
            verified: true,
            customer: customer || null,
            phone: localPhone,
        };
    }

    async register(phone: string, name: string) {
        let customer = await this.prisma.customer.findUnique({ where: { phone } });
        if (!customer) {
            customer = await this.prisma.customer.create({
                data: { phone, name },
            });
        }
        return customer;
    }
}
