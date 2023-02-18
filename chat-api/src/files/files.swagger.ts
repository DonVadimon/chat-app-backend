import { ApiProperty } from '@nestjs/swagger';
import { FileEntity } from '@prisma/client';

export class ApiFileEntityResponse implements FileEntity {
    @ApiProperty()
    id: number;
    @ApiProperty()
    originalName: string;
    @ApiProperty()
    path: string;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    updatedAt: Date;
}
