import { UserEntity, UserRoles } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntityResponseDto implements UserEntity {
    id: number;
    username: string;
    @Exclude({ toPlainOnly: true })
    password: string;
    name: string;
    roles: UserRoles[];
    email: string;
    isEmailConfirmed: boolean;
    avatarFileEntityId: number | null;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}
