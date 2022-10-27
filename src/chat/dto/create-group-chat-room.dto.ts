import { ApiProperty } from '@nestjs/swagger';
import { ChatRoles, Prisma } from '@prisma/client';
import { ArrayMinSize, ArrayUnique, IsArray, IsEnum, IsInt } from 'class-validator';

export class CreateGroupChatRoomMemberDto {
    @ApiProperty()
    @IsInt()
    userId: number;

    @ApiProperty()
    @IsInt()
    chatRoomId: number;

    @ApiProperty()
    @IsEnum(ChatRoles)
    role: ChatRoles;
}

export class CreateGroupChatRoomDto implements Partial<Record<keyof Prisma.ChatRoomEntityCreateInput, unknown>> {
    @ApiProperty()
    @IsArray()
    @ArrayMinSize(2)
    @ArrayUnique()
    @IsInt({ each: true })
    members: number[];

    @ApiProperty()
    name?: string;

    @ApiProperty()
    description?: string;
}
