import { IsNotEmpty } from 'class-validator';

export class DeleteUserDto {
    @IsNotEmpty()
    id: number;
}
