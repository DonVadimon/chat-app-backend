import { UserEntity } from '@prisma/client';
import { Request } from 'express';
import { Socket } from 'socket.io';

export type ValidationPayload = {
    username: string;
    id: number;
};

export enum WsAuthEvents {
    ERROR = 'AUTH/ERROR',
}

export type UserInReq = Pick<UserEntity, keyof UserEntity>;

export type SocketWithUser = Socket & {
    data: {
        user: UserInReq;
    };
};

export type RequestWithUser = Request & {
    user: UserInReq;
};

export type UserIdentificators = Partial<Record<keyof Pick<UserEntity, 'id' | 'email' | 'username'>, string>>;
