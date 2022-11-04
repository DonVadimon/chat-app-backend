import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UsersService } from '@/users/users.service';

@Injectable()
export class UniqueUsernameEmailGuard implements CanActivate {
    constructor(private readonly usersService: UsersService, private readonly prismaService: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const dto: CreateUserDto = await context.switchToHttp().getRequest<Request>().body;

            const [userByUsername, userByEmail] = await this.prismaService.$transaction([
                this.usersService.getByUsername(dto.username),
                this.usersService.getByEmail(dto.email),
            ]);

            if (userByUsername) {
                throw new Error(`User with username ${userByUsername.username} already exists`);
            }

            if (userByEmail) {
                throw new Error(`User with email ${userByEmail.email} already exists`);
            }

            return true;
        } catch (error) {
            throw new BadRequestException(`Invalid username or email. ${error.message ?? ''}`);
        }
    }
}
