import { UserEntity } from '@prisma/client';
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
