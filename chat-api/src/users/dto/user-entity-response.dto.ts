import { UserEntity, UserRoles } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntityResponseDto<T> implements UserEntity {
    id: number;
    username: string;
    @Exclude({ toPlainOnly: true })
    password: string;
    name: string;
    roles: UserRoles[];
    email: string;
    isEmailConfirmed: boolean;
    avatarFileEntityId: number | null;

    constructor(partial: Partial<UserEntity & T>) {
        Object.assign(this, partial);
    }

    cast() {
        return this as unknown as UserEntity & T;
    }
}
