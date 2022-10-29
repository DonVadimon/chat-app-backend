import { ApiProperty } from '@nestjs/swagger';
import { ChatRoomType } from '@prisma/client';

import { ChatMessageEntitySearchItem, ChatRoomEntitySearchItem, UserEntitySearchItem } from './search.types';

export class ApiChatMessageEntitySearchItemResponse implements ChatMessageEntitySearchItem {
    @ApiProperty()
    chatRoomEntityId: number;
    @ApiProperty()
    id: number;
    @ApiProperty()
    content: string;
}

export class ApiChatRoomEntitySearchItemResponse implements ChatRoomEntitySearchItem {
    @ApiProperty()
    id: number;
    @ApiProperty({ enum: ChatRoomType })
    type: ChatRoomType;
    @ApiProperty()
    name: string;
    @ApiProperty()
    description: string;
}

export class ApiUserEntitySearchItemResponse implements UserEntitySearchItem {
    @ApiProperty()
    id: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    username: string;
    @ApiProperty()
    email: string;
}
