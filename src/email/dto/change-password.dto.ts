import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { EmailTokenDto } from './email-token.dto';

export class ChangePasswordDto extends EmailTokenDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    newPassword: string;
}
