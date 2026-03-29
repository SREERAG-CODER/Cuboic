"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = require("dns");
(0, dns_1.setDefaultResultOrder)('ipv4first');
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🚀 Thambi backend running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map