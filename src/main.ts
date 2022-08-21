import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    app.enableCors({ credentials: true, origin: 'http://localhost:3001' });
    await app.listen(process.env.APP_PORT);
}
bootstrap();
