import { IsNotEmpty, IsString } from 'class-validator';

export class CheckUsernameAvailableDto {
    @IsNotEmpty()
    @IsString()
    username: string;
}
