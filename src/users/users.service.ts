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

    async getByUsername(username: string): Promise<UserEntity | undefined> {
        const user = await this.prisma.userEntity.findFirst({
            where: {
                username,
            },
        });
        return user;
    }

    async getById(id: number): Promise<UserEntity | undefined> {
        const user = await this.prisma.userEntity.findFirst({
            where: {
                id,
            },
        });
        return user;
    }

    async createUser({ password, ...rest }: CreateUserDto): Promise<UserEntity> {
        const findedUser = await this.getByUsername(rest.username);
        if (findedUser) {
            throw new Error('User with that username already exists');
        }
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

    async deleteUser(dto: DeleteUserDto): Promise<UserEntity> {
        return await this.prisma.userEntity.delete({
            where: dto,
        });
    }
}
