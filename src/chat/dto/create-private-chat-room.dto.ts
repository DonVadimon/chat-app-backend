import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

import { CreatePrivateChatRoomEventDto } from './create-private-chat-room-event.dto';

export class CreatePrivateChatRoomDto extends CreatePrivateChatRoomEventDto {
    @ApiProperty()
    @IsInt()
    firstMemberId: number;
}
