import { Injectable } from '@nestjs/common';
import { UserEntity } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async getAllUsers(): Promise<UserEntity[]> {
        const users = await this.prisma.userEntity.findMany();
        users.forEach((user) => (user.password = undefined));
        return users;
    }

    getByUsername(username: string) {
        return this.prisma.userEntity.findFirst({
            where: {
                username: username || '',
            },
        });
    }

    getByEmail(email: string) {
        return this.prisma.userEntity.findFirst({
            where: {
                email: email || '',
            },
        });
    }

    async getById(id: number): Promise<Omit<UserEntity, 'password'> | undefined> {
        return this.prisma.userEntity.findFirst({
            where: {
                id,
            },
            select: {
                email: true,
                id: true,
                name: true,
                roles: true,
                username: true,
                isEmailConfirmed: true,
            },
        });
    }

    async createUser({ password, ...rest }: CreateUserDto): Promise<UserEntity> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const dto = {
            ...rest,
            password: hashedPassword,
        };
        const createdUser = await this.prisma.userEntity.create({ data: dto });
        createdUser.password = undefined;
        return createdUser;
    }

    async updateUser(id: number, dto: UpdateUserDto): Promise<UserEntity> {
        const user = await this.prisma.userEntity.update({
            data: dto,
            where: {
                id,
            },
        });

        user.password = undefined;
        return user;
    }

    async markUserEmailAsConfirmed(email: string) {
        const user = await this.prisma.userEntity.update({
            data: {
                isEmailConfirmed: true,
            },
            where: {
                email: email || '',
            },
        });

        user.password = undefined;
        return user;
    }

    async deleteUser(dto: DeleteUserDto): Promise<UserEntity> {
        return this.prisma.userEntity.delete({
            where: dto,
        });
    }
}
