import { ChatMessageEntity, ChatRoomEntity, UserEntity } from '@prisma/client';

export type ChatMessageEntitySearchItem = Pick<ChatMessageEntity, 'id' | 'content' | 'chatRoomEntityId'>;

export type ChatRoomEntitySearchItem = Pick<ChatRoomEntity, 'id' | 'type' | 'name' | 'description'>;

export type UserEntitySearchItem = Pick<UserEntity, 'id' | 'username' | 'name' | 'email'>;
