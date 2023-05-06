import { BadRequestException, CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';

import { RequestWithUser } from '@/auth/auth.types';
import { UsersService } from '@/users/users.service';

@Injectable()
export class EmailConfirmedGuard implements CanActivate {
    constructor(private readonly usersService: UsersService) {}

    private logger: Logger = new Logger(EmailConfirmedGuard.name);

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const { user } = context.switchToHttp().getRequest<RequestWithUser>();

            if (!user.isEmailConfirmed) {
                throw new Error(`Email is not confirmed`);
            }

            return true;
        } catch (error) {
            this.logger.error(error);

            throw new BadRequestException(error.message);
        }
    }
}
