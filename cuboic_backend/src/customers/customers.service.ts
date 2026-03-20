import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class CustomersService implements OnModuleInit {

    constructor(private prisma: PrismaService) { }

    onModuleInit() {
        if (!admin.apps.length) {
            try {
                // 🔥 Ensure env exists
                if (!process.env.FIREBASE_CONFIG) {
                    throw new Error('FIREBASE_CONFIG is missing in environment variables');
                }

                // ✅ Parse full JSON config
                const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

                // 🔥 CRITICAL: Fix private key formatting
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

                // ✅ Initialize Firebase Admin
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });

                console.log('[Firebase Admin] Initialized successfully.');

            } catch (err: any) {
                console.error('[Firebase Admin] Initialization failed:', err.message);
                throw err; // Fail fast (important for production)
            }
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

        // Strip +91 for consistency
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
        let customer = await this.prisma.customer.findUnique({
            where: { phone },
        });

        if (!customer) {
            customer = await this.prisma.customer.create({
                data: { phone, name },
            });
        }

        return customer;
    }
}