import { IsMongoId } from 'class-validator';

export class DeleteUserDto {
    @IsMongoId()
    _id: string;
}
