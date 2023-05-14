import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { AppModule } from './app/app.module';
import { EmptyResponseInterceptor } from './app/interceptors/empty-response.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useLogger(app.get(Logger));
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalInterceptors(new LoggerErrorInterceptor(), new EmptyResponseInterceptor());
    app.use(cookieParser());
    app.setGlobalPrefix(process.env.CHAT_API_UPSTREAM);

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Chat App Backend - SWAGGER')
        .setDescription('chat app backend')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${process.env.CHAT_API_UPSTREAM}/swagger`, app, document);

    await app.listen(process.env.CHAT_API_PORT);
}
bootstrap();
