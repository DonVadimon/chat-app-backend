import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateChatRoomDto implements Prisma.ChatRoomEntityUpdateInput {
    @ApiProperty()
    @IsInt()
    roomId: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;
}
