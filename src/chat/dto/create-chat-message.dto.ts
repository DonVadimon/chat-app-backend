import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateChatMessageDto {
    @ApiProperty()
    @IsNotEmpty()
    content: string;

    @ApiProperty()
    @IsInt()
    roomId: number;

    @ApiProperty()
    @IsInt()
    authorId: number;
}
