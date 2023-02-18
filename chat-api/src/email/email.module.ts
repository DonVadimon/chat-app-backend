import path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

import { PrismaModule } from '@/prisma/prisma.module';
import { UsersModule } from '@/users/users.module';

import { EmailService } from './services/email.service';
import { EmailUtilsService } from './services/email.utils.service';
import { EmailController } from './email.controller';

@Module({
    imports: [
        PrismaModule,
        UsersModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService<AppConfig>) => ({
                secret: configService.get('MAIL_JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get('MAIL_EXPIRATION_TIME'),
                },
            }),
        }),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService<AppConfig>) => {
                const transport = configService.get('MAIL_TRANSPORT');
                const mailFromName = configService.get('MAIL_FROM_NAME');
                const mailFromAddress = transport.split(':')[1].split('//')[1];

                return {
                    transport,
                    defaults: {
                        from: `"${mailFromName}" <${mailFromAddress}>`,
                    },
                    template: {
                        dir: path.join(__dirname, '..', '..', 'email', 'templates'),
                        adapter: new EjsAdapter(),
                        options: {
                            strict: true,
                        },
                    },
                };
            },
        }),
    ],
    exports: [EmailService],
    providers: [EmailService, EmailUtilsService],
    controllers: [EmailController],
})
export class EmailModule {}
