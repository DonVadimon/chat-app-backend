import { ApiProperty } from '@nestjs/swagger';
import { ChatRoomType, Prisma } from '@prisma/client';
import { ArrayMinSize, ArrayUnique, IsArray, IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export class CreateChatRoomDto implements Partial<Record<keyof Prisma.ChatRoomEntityCreateInput, unknown>> {
    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(ChatRoomType)
    type: ChatRoomType;

    @ApiProperty()
    @IsArray()
    @ArrayMinSize(2)
    @ArrayUnique()
    @IsInt({ each: true })
    members?: number[];

    @ApiProperty()
    name?: string;

    @ApiProperty()
    description?: string;
}
