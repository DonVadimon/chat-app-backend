import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { AppModule } from './app/app.module';
import { CORS_ORIGINS } from './constants';

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useLogger(app.get(Logger));
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalInterceptors(new LoggerErrorInterceptor());
    app.use(cookieParser());
    app.enableCors({
        credentials: true,
        origin: CORS_ORIGINS,
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
