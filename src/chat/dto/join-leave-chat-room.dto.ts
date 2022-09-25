import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class JoinLeaveChatRoomDto {
    @ApiProperty()
    @IsInt()
    userId: number;

    @ApiProperty()
    @IsInt()
    roomId: number;
}
