import { ChatMessageEntity, ChatRoomEntity, UserEntity } from '@prisma/client';

export enum ChatIncomingEvents {
    /**
     * Receive new chat message data
     */
    SEND_MESSAGE_TO_SERVER = 'CHAT/SEND_MESSAGE_TO_SERVER',
    /**
     * Recieve request to add new member to GROUP chat room
     */
    CLIENT_JOIN_GROUP_ROOM = 'CHAT/CLIENT_JOIN_GROUP_ROOM',
    /**
     * Recieve request to exclude member from GROUP chat room
     */
    CLIENT_LEAVE_GROUP_ROOM = 'CHAT/CLIENT_LEAVE_GROUP_ROOM',
    /**
     * Recieve request to delete PRIVATE chat room
     */
    CLIENT_LEAVE_PRIVATE_ROOM = 'CHAT/CLIENT_LEAVE_PRIVATE_ROOM',
    /**
     * Recieve request to create new GROUP chat room
     */
    NEW_GROUP_ROOM_CREATE = 'CHAT/NEW_GROUP_ROOM_CREATE',
    /**
     * Recieve request to create new PRIVATE chat room
     */
    NEW_PRIVATE_ROOM_CREATE = 'CHAT/NEW_PRIVATE_ROOM_CREATE',
    /**
     * Recieve request to update chat room info
     */
    UPDATE_ROOM_ENTITY = 'CHAT/UPDATE_ROOM_ENTITY',
}

export enum ChatOutgoingEvents {
    /**
     * Send initial data to connected client
     */
    CLIENT_CONNECTED = 'CHAT/CLIENT_CONNECTED',
    /**
     * Send new chat message in room
     */
    SEND_MESSAGE_TO_CLIENT = 'CHAT/SEND_MESSAGE_TO_CLIENT',
    /**
     * Send room data that user joined and that was already configured
     */
    CLIENT_JOINED_ROOM = 'CHAT/CLIENT_JOINED_ROOM',
    /**
     * Send notification that user was excluded from chat room
     */
    CLIENT_LEAVED_ROOM = 'CHAT/CLIENT_LEAVED_ROOM',
    /**
     * Send GROUP chat room where member was excluded from
     */
    MEMBER_EXCLUDED_FROM_GROUP_ROOM = 'CHAT/MEMBER_EXCLUDED_FROM_GROUP_ROOM',
    /**
     * Send GROUP chat room where new member was added to
     */
    NEW_MEMBER_ADDED_TO_GROUP_ROOM = 'CHAT/NEW_MEMBER_ADDED_TO_GROUP_ROOM',
    /**
     * Send cew chat room
     */
    NEW_ROOM_CREATED = 'CHAT/NEW_ROOM_CREATED',
    /**
     * Send message with updated chat room
     */
    ROOM_ENTITY_UPDATED = 'CHAT/ROOM_ENTITY_UPDATED',
}

export type ChatRoomWithMembers = ChatRoomEntity & {
    members: UserEntity[];
};

export type ChatMessageAuthor = {
    id: number;
    name: string;
    username: string;
};

export type ChatMessageDetails = ChatMessageEntity & {
    author: ChatMessageAuthor;
};

export type ChatRoomDetails = ChatRoomEntity & {
    members: UserEntity[];
    messages: ChatMessageDetails[];
};

export type RoomIdExtractor<T> = (data: T) => number;
