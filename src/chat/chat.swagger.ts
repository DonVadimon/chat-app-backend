import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatMessageEntity, ChatRoomEntity, ChatRoomType, UserEntity } from '@prisma/client';

import { ApiUserEntityResponse } from '@/users/users.swagger';

import { ChatMessageAuthor, ChatMessageDetails, ChatRoomDetails } from './chat.types';

export class ApiChatMessageEntityResponse implements ChatMessageEntity {
    @ApiProperty()
    id: number;
    @ApiProperty()
    content: string;
    @ApiProperty()
    chatRoomEntityId: number;
    @ApiProperty()
    authorEntityId: number;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    updatedAt: Date;
}

export class ApiChatMessageAuthorResponse implements ChatMessageAuthor {
    @ApiProperty()
    id: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    username: string;
}

export class ApiChatMessageEntityDetailsResponse implements ChatMessageDetails {
    @ApiProperty()
    id: number;
    @ApiProperty()
    content: string;
    @ApiProperty()
    chatRoomEntityId: number;
    @ApiProperty()
    authorEntityId: number;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    updatedAt: Date;
    @ApiProperty({ type: ApiChatMessageAuthorResponse })
    author: ChatMessageAuthor;
}

export class ApiChatRoomEntityResponse implements ChatRoomEntity {
    @ApiProperty()
    id: number;
    @ApiProperty({ enum: ChatRoomType })
    type: ChatRoomType;
    @ApiPropertyOptional()
    name: string;
    @ApiPropertyOptional()
    description: string;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    updatedAt: Date;
}

export class ApiChatRoomEntityDetailsResponse extends ApiChatRoomEntityResponse implements ChatRoomDetails {
    @ApiProperty({ type: ApiUserEntityResponse, isArray: true })
    members: UserEntity[];
    @ApiProperty({ type: ApiChatMessageEntityDetailsResponse, isArray: true })
    messages: ChatMessageDetails[];
}
