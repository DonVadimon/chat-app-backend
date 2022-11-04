import path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

import { UsersModule } from '@/users/users.module';

import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
    imports: [
        UsersModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService<NodeJS.ProcessEnv>) => ({
                secret: configService.get('MAIL_JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get('MAIL_EXPIRATION_TIME'),
                },
            }),
        }),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService<NodeJS.ProcessEnv>) => {
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
    providers: [EmailService],
    controllers: [EmailController],
})
export class EmailModule {}
