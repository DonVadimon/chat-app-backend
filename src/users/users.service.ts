import { Injectable } from '@nestjs/common';
import { UserEntity } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/prisma/prisma.service';

import { AddOrUpdateAvatarDto } from './dto/add-or-update-avatar.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async getAllUsers(): Promise<UserEntity[]> {
        return this.prisma.userEntity.findMany();
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

    getById(id: number) {
        return this.prisma.userEntity.findFirst({
            where: {
                id,
            },
            include: {
                avatar: true,
            },
        });
    }

    async createUser({ password, ...rest }: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const dto = {
            ...rest,
            password: hashedPassword,
        };

        return this.prisma.userEntity.create({ data: dto });
    }

    async updateUser(id: number, dto: UpdateUserDto) {
        return this.prisma.userEntity.update({
            data: dto,
            where: {
                id,
            },
        });
    }

    async markUserEmailAsConfirmed(email: string) {
        return this.prisma.userEntity.update({
            data: {
                isEmailConfirmed: true,
            },
            where: {
                email: email || '',
            },
        });
    }

    async changePassword(email: string, newPassword: string) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        return this.prisma.userEntity.update({
            data: { password: hashedPassword },
            where: {
                email: email || '',
            },
        });
    }

    async deleteUser(dto: DeleteUserDto): Promise<UserEntity> {
        return this.prisma.userEntity.delete({
            where: dto,
        });
    }

    async addOrUpdateAvatar(dto: AddOrUpdateAvatarDto) {
        const user = await this.getById(dto.userId);
        const action = user.avatarFileEntityId ? 'update' : 'create';

        return this.prisma.userEntity.update({
            where: {
                id: dto.userId,
            },
            data: {
                avatar: {
                    [action]: {
                        originalName: dto.avatar.originalname,
                        path: dto.avatar.path,
                    },
                },
            },
            include: {
                avatar: true,
            },
        });
    }

    deleteAvatar(userId: number) {
        return this.prisma.userEntity.update({
            where: {
                id: userId,
            },
            data: {
                avatar: {
                    delete: true,
                },
            },
        });
    }
}
