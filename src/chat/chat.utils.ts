import { JoinLeaveGroupChatRoomDto } from './dto/join-leave-group-chat-room.dto';
import { RoomIdExtractor } from './chat.types';

export const joinLeaveRoomIdExtractor: RoomIdExtractor<JoinLeaveGroupChatRoomDto> = (dto) => dto.roomId;
