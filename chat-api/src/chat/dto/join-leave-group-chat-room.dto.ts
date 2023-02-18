import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class JoinLeaveGroupChatRoomDto {
    @ApiProperty()
    @IsInt()
    userId: number;

    @ApiProperty()
    @IsInt()
    roomId: number;
}
