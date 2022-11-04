import { URL } from 'url';

import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UserEntity } from '@prisma/client';

import { UsersService } from '@/users/users.service';

import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { ConfirmEmailPayload } from './email.types';

@Injectable()
export class EmailService {
    constructor(
        private readonly configService: ConfigService<NodeJS.ProcessEnv>,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly usersService: UsersService,
    ) {}

    private logger: Logger = new Logger('EmailService');

    private getConfirmEmailUrl(jwtToken: string, basePath?: string) {
        const url = new URL(basePath ?? this.configService.get('MAIL_CONFIRM_URL'));
        url.searchParams.append('confirmEmailToken', jwtToken);
        return url.toString();
    }

    generateJwtToken(payload: ConfirmEmailPayload) {
        return this.jwtService.signAsync(payload);
    }

    async decodeEmailConfirmationToken(token: string) {
        const payload = await this.jwtService.verifyAsync<ConfirmEmailPayload>(token);

        if (typeof payload?.email !== 'string') {
            throw new BadRequestException('Bad confirmation token');
        }

        return payload.email;
    }

    async sendConfirmEmailMessage(user: Pick<UserEntity, 'email' | 'username'>) {
        const jwtToken = await this.generateJwtToken({ email: user.email });

        try {
            return this.mailerService
                .sendMail({
                    to: user.email,
                    subject: 'Подтверждение регистрации',
                    template: 'confirm-email',
                    context: {
                        confirmUrl: this.getConfirmEmailUrl(jwtToken),
                        // ? extra dev links
                        frontLocalUrl: this.getConfirmEmailUrl(jwtToken, 'http://localhost:8100'),
                        frontProdUrl: this.getConfirmEmailUrl(jwtToken, 'https://chat-app-frontend-two.vercel.app'),
                        backLocalUrl: this.getConfirmEmailUrl(jwtToken, 'http://localhost:3003'),
                        backProdUrl: this.getConfirmEmailUrl(jwtToken, 'https://don-vadimon.online'),
                    },
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            this.logger.error(`Send confirm email error: `, error);
            throw new HttpException(
                `Send confirm email error: ${JSON.stringify(error)}`,
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
    }

    async confirmEmail(dto: ConfirmEmailDto) {
        const email = await this.decodeEmailConfirmationToken(dto.token);
        return this.usersService.markUserEmailAsConfirmed(email);
    }

    async resendConfirmationLink(userId: number) {
        const user = await this.usersService.getById(userId);
        if (user.isEmailConfirmed) {
            throw new BadRequestException('Email already confirmed');
        }
        await this.sendConfirmEmailMessage(user);
    }
}
