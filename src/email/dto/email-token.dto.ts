import { IsNotEmpty, IsString } from 'class-validator';

export class EmailTokenDto {
    @IsString()
    @IsNotEmpty()
    token: string;
}
