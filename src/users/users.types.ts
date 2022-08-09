import { User } from './schemas/user.schema';

export type UserInReq = Pick<User, keyof User> & { _id: string };

export type UserReq = Request & {
    user: UserInReq;
};
