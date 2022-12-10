import { IsInt, IsPositive } from 'class-validator';

export class AddOrUpdateAvatarDto {
    @IsPositive()
    @IsInt()
    userId: number;

    avatar: Express.Multer.File;
}
