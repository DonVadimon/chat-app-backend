import { IsNotEmpty } from 'class-validator';

export class CheckUsernameAvailableDto {
    @IsNotEmpty()
    username: string;
}
