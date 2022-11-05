import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    HttpException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { RequestWithUser } from '@/auth/auth.types';
import { EmailTokenDto } from '@/email/dto/email-token.dto';
import { EmailService } from '@/email/services/email.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class EqualEmailsGuard implements CanActivate {
    constructor(private readonly usersService: UsersService, private readonly emailService: EmailService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const dto: EmailTokenDto = context.switchToHttp().getRequest<Request>().body;

            const currentUser = context.switchToHttp().getRequest<RequestWithUser>().user;

            const { email: confirmingEmail } = await this.emailService.decodeEmailToken(dto.token);

            const userByEmail = await this.usersService.getByEmail(confirmingEmail);

            if (currentUser.email !== userByEmail.email) {
                throw new UnauthorizedException(`Can't confirm email from another account`);
            }

            return true;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException();
            }
        }
    }
}
