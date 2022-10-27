import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { UserRoles } from '@prisma/client';

import { RequestWithUser } from '@/auth/auth.types';

import { JwtAuthGuard } from './jwt-auth.guard';

export const RolesGuard = (...requiredRoles: UserRoles[]): Type<CanActivate> => {
    class RoleGuardMixin extends JwtAuthGuard {
        async canActivate(context: ExecutionContext) {
            await super.canActivate(context);

            const { user } = context.switchToHttp().getRequest<RequestWithUser>();

            return requiredRoles.some((role) => user.roles?.includes(role));
        }
    }

    return mixin(RoleGuardMixin);
};
