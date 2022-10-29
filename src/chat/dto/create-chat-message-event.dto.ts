import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateChatMessageEventDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    content: string;

    @ApiProperty()
    @IsInt()
    roomId: number;
}
