import { ApiProperty } from '@nestjs/swagger';
import { Prisma, UserRoles } from '@prisma/client';
import { ArrayUnique, IsArray, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto implements Prisma.UserEntityUpdateInput {
    @ApiProperty()
    @IsString()
    @IsOptional()
    username?: string;

    @ApiProperty()
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsEnum(UserRoles, { each: true })
    roles?: UserRoles[];

    @ApiProperty()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty()
    @IsOptional()
    @IsEmail()
    email?: string;
}
