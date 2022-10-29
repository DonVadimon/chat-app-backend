import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteUserDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    id: number;
}
