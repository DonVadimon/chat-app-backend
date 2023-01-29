import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

import { CreateChatMessageEventDto } from './create-chat-message-event.dto';

export class CreateChatMessageDto extends CreateChatMessageEventDto {
    @ApiProperty()
    @IsInt()
    authorId: number;
}
