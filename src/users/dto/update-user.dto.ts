import { Prisma, UserRoles } from '@prisma/client';
import { ArrayUnique, IsArray, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class UpdateUserDto implements Prisma.UserEntityUpdateInput {
    username?: string;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsEnum(UserRoles, { each: true })
    roles?: UserRoles[];

    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;
}
