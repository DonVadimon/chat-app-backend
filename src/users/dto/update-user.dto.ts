import { ArrayUnique, IsArray, IsEmail, IsEnum, IsOptional, IsUrl } from 'class-validator';

import { Roles } from '@/users/schemas/user.schema';

import { CreateUserDto } from './create-user.dto';

export type UpdateUserDtoFields = Partial<Omit<CreateUserDto, 'password'>>;

export class UpdateUserDto implements UpdateUserDtoFields {
    username?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsUrl()
    git?: string;

    name?: string;

    phone?: string;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsEnum(Roles, { each: true })
    roles?: Roles[];

    telegram?: string;

    urlPrefixes?: string[];
}
