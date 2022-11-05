import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { RequestWithUser } from '@/auth/auth.types';
import { UsersService } from '@/users/users.service';

@Injectable()
export class EmailConfirmedGuard implements CanActivate {
    constructor(private readonly usersService: UsersService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const { user } = context.switchToHttp().getRequest<RequestWithUser>();

            if (!user.isEmailConfirmed) {
                throw new Error(`Email is not confirmed`);
            }

            return true;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
