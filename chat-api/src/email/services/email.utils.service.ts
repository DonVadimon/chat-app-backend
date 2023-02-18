import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MailType } from '@/email/email.types';

@Injectable()
export class EmailUtilsService {
    constructor(private readonly configService: ConfigService<AppConfig>) {}

    private getConfirmEmailUrl(jwtToken: string, basePath?: string) {
        const url = new URL(basePath ?? this.configService.get('MAIL_CONFIRM_URL'));
        url.searchParams.append('confirmEmailToken', jwtToken);
        return url.toString();
    }

    private getForgotPasswordUrl(jwtToken: string, basePath?: string) {
        const url = new URL(basePath ?? this.configService.get('MAIL_FORGOT_PASSWORD_URL'));
        url.searchParams.append('forgotPasswordToken', jwtToken);
        return url.toString();
    }

    constructMailUrl(type: MailType, jwtToken: string, basePath?: string) {
        switch (type) {
            case MailType.CONFIRM_EMAIL:
                return this.getConfirmEmailUrl(jwtToken, basePath);
            case MailType.FORGOT_PASSWORD:
                return this.getForgotPasswordUrl(jwtToken, basePath);
            default:
                throw new InternalServerErrorException('Unsupported mail type');
        }
    }

    getExtraDevLinks(type: MailType, jwtToken: string) {
        return {
            frontLocalUrl: this.constructMailUrl(type, jwtToken, 'http://localhost:8100'),
            frontProdUrl: this.constructMailUrl(type, jwtToken, 'https://chat-app-frontend-two.vercel.app'),
            backLocalUrl: this.constructMailUrl(type, jwtToken, 'http://localhost:3003'),
            backProdUrl: this.constructMailUrl(type, jwtToken, 'https://don-vadimon.online'),
        };
    }
}
