import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class SearchParamsDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    searchString: string;

    @ApiProperty()
    @IsEnum(Prisma.SortOrder)
    @IsNotEmpty()
    sortDirection?: Prisma.SortOrder = Prisma.SortOrder.desc;

    @ApiProperty()
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    offset?: number = 0;

    @ApiProperty()
    @IsInt()
    @Max(100)
    @Min(1)
    @IsNotEmpty()
    limit?: number = 100;
}
