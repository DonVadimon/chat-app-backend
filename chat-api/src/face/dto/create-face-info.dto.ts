import { ApiProperty } from '@nestjs/swagger';
import { Gender, Prisma } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateFaceInfoDto implements Omit<Prisma.FaceInfoEntityCreateInput, 'user'> {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    age: string;

    @ApiProperty({ enum: Gender })
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    leftEyeColor: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    rightEyeColor: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    hairColor: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    skinColor: string;
}
