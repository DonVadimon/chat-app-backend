import { IsEmail, IsEnum, IsNotEmpty, IsUrl } from 'class-validator';

import { Roles, User } from '@/users/schemas/user.schema';

export class CreateUserDto implements Omit<Pick<User, keyof User>, '_id'> {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    @IsUrl()
    git: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    phone: string;

    @IsNotEmpty()
    @IsEnum(Roles, { each: true })
    roles: Roles[];

    @IsNotEmpty()
    telegram: string;

    @IsNotEmpty()
    urlPrefixes: string[];
}
