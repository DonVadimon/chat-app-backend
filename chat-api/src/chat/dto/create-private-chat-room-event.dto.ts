import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePrivateChatRoomEventDto implements Partial<Record<keyof Prisma.ChatRoomEntityCreateInput, unknown>> {
    @ApiProperty()
    @IsInt()
    secondMemberId: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;
}
