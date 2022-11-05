import {
    CanActivate,
    ExecutionContext,
    HttpException,
    Injectable,
    InternalServerErrorException,
    Logger,
    mixin,
    Type,
} from '@nestjs/common';
import { Request } from 'express';

import { UserIdentificators } from '@/auth/auth.types';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Extracts user identificator from request.body
 * Finds user by identificator
 * Attaches user to request
 *
 * @param findBy object of identificators that will be searched in request body
 *
 * Key of findBy - UserEntity key
 *
 * Value of findBy - request body key
 */
export const UserExistGuard = (findBy: UserIdentificators): Type<CanActivate> => {
    @Injectable()
    class UserExistGuardMixin {
        constructor(private readonly prismaService: PrismaService) {}

        private logger: Logger = new Logger('UserExistGuard');

        async canActivate(context: ExecutionContext): Promise<boolean> {
            try {
                const request = context.switchToHttp().getRequest<Request>();

                const { body } = request;

                const [identificationPair] = Object.entries(findBy).filter(([, value]) => !!value);

                if (!identificationPair) {
                    throw new InternalServerErrorException('No identificator provided to find user');
                }

                const [userEntityKey, bodyKey] = identificationPair;

                const user = await this.prismaService.userEntity.findUniqueOrThrow({
                    where: {
                        [userEntityKey]: body[bodyKey],
                    },
                });

                request.user = { ...user, password: undefined };

                return !!user;
            } catch (error) {
                this.logger.error(error);

                if (error instanceof HttpException) {
                    throw error;
                } else {
                    throw new InternalServerErrorException();
                }
            }
        }
    }

    return mixin(UserExistGuardMixin);
};
