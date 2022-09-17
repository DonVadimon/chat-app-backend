import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserEntity, UserRoles } from '@prisma/client';

export class ApiUserEntityResponse implements UserEntity {
    @ApiProperty()
    id: number;

    @ApiProperty()
    username: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ enum: UserRoles })
    roles: UserRoles[];

    @ApiPropertyOptional()
    email: string;
}

export class ApiCheckUsernameAvailableResponse {
    @ApiProperty()
    available: boolean;
}
