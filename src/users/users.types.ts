import { UserEntity } from '@prisma/client';

export type UserInReq = Pick<UserEntity, keyof UserEntity> & { id: string };

export type UserReq = Request & {
    user: UserInReq;
};
