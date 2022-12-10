import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, UserRoles } from '@prisma/client';
import { ArrayUnique, IsArray, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto implements Prisma.UserEntityUpdateInput {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    username?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsEnum(UserRoles, { each: true })
    roles?: UserRoles[];

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;
}
