import { ApiProperty } from '@nestjs/swagger';
import { Gender, Prisma } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateFaceInfoDto implements Omit<Prisma.FaceInfoEntityUpdateInput, 'user'> {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    age?: string;

    @ApiProperty()
    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    leftEyeColor?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    rightEyeColor?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    hairColor?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    skinColor?: string;
}
