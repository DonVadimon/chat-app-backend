import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UserEntity } from '@prisma/client';

import { ChangePasswordDto } from '@/email/dto/change-password.dto';
import { ConfirmEmailDto } from '@/email/dto/confirm-email.dto';
import { ConfirmEmailPayload, MailType } from '@/email/email.types';
import { UsersService } from '@/users/users.service';

import { EmailUtilsService } from './email.utils.service';

@Injectable()
export class EmailService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly usersService: UsersService,
        private readonly emailUtilsService: EmailUtilsService,
    ) {}

    private logger: Logger = new Logger(EmailService.name);

    generateJwtToken(payload: ConfirmEmailPayload) {
        return this.jwtService.signAsync(payload);
    }

    async decodeEmailToken(token: string) {
        const payload = await this.jwtService.verifyAsync<ConfirmEmailPayload>(token);

        if (typeof payload?.email !== 'string') {
            throw new BadRequestException('Bad token');
        }

        return payload;
    }

    async sendConfirmEmailMessage(user: Pick<UserEntity, 'email'>) {
        const jwtToken = await this.generateJwtToken({ email: user.email });

        try {
            return this.mailerService
                .sendMail({
                    to: user.email,
                    subject: 'Подтверждение регистрации',
                    template: 'confirm-email',
                    context: {
                        confirmUrl: this.emailUtilsService.constructMailUrl(MailType.CONFIRM_EMAIL, jwtToken),
                        ...this.emailUtilsService.getExtraDevLinks(MailType.CONFIRM_EMAIL, jwtToken),
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
        const { email } = await this.decodeEmailToken(dto.token);
        return this.usersService.markUserEmailAsConfirmed(email);
    }

    async resendConfirmationLink(userId: number) {
        const user = await this.usersService.getById(userId);
        if (user.isEmailConfirmed) {
            throw new BadRequestException('Email already confirmed');
        }
        await this.sendConfirmEmailMessage(user);
    }

    async sendForgotPasswordEmail(user: Pick<UserEntity, 'email'>) {
        const jwtToken = await this.generateJwtToken({ email: user.email });

        try {
            return this.mailerService
                .sendMail({
                    to: user.email,
                    subject: 'Смена пароля',
                    template: 'forgot-password',
                    context: {
                        forgotPasswordUrl: this.emailUtilsService.constructMailUrl(MailType.FORGOT_PASSWORD, jwtToken),
                        ...this.emailUtilsService.getExtraDevLinks(MailType.FORGOT_PASSWORD, jwtToken),
                    },
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            this.logger.error(`Send forgot password email error: `, error);
            throw new HttpException(
                `Send forgot password email error: ${JSON.stringify(error)}`,
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
    }

    async changePassword(dto: ChangePasswordDto) {
        const { email } = await this.decodeEmailToken(dto.token);
        return this.usersService.changePassword(email, dto.newPassword);
    }
}
