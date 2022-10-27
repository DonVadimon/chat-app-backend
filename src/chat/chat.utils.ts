import { JoinLeaveGroupChatRoomDto } from './dto/join-leave-group-chat-room.dto';
import { RoomIdExtractor } from './guards/room-type.guard';

export const joinLeaveRoomIdExtractor: RoomIdExtractor<JoinLeaveGroupChatRoomDto> = (dto) => dto.roomId;
