import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    app.enableCors({
        credentials: true,
        origin: [
            'http://localhost:8100',
            'https://chat-app-frontend-two.vercel.app',
            'https://chat-app-frontend-git-master-antoffee.vercel.app',
            'https://chat-app-frontend-antoffee.vercel.app',
        ],
    });

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Chat App Backend - SWAGGER')
        .setDescription('chat app backend')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, document);

    await app.listen(process.env.PORT || process.env.APP_PORT);
}
bootstrap();
