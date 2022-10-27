import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsInt } from 'class-validator';

export class CreatePrivateChatRoomEventDto implements Partial<Record<keyof Prisma.ChatRoomEntityCreateInput, unknown>> {
    @ApiProperty()
    @IsInt()
    secondMemberId: number;

    @ApiProperty()
    name?: string;

    @ApiProperty()
    description?: string;
}
