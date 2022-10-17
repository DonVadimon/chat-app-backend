import { ApiProperty } from '@nestjs/swagger';
import { Prisma, UserRoles } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto implements Prisma.UserEntityCreateInput {
    @ApiProperty()
    @IsNotEmpty()
    username: string;

    @ApiProperty()
    @IsNotEmpty()
    password: string;

    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsNotEmpty()
    @IsEmail()
    email?: string;

    @ApiProperty()
    @IsOptional()
    @IsNotEmpty()
    @IsEnum(UserRoles, { each: true })
    roles?: UserRoles[];
}
