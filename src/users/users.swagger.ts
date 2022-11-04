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
    @ApiProperty({ enum: UserRoles, isArray: true })
    roles: UserRoles[];
    @ApiPropertyOptional()
    email: string;
    @ApiProperty()
    isEmailConfirmed: boolean;
}

export class ApiCheckUsernameAvailableResponse {
    @ApiProperty()
    available: boolean;
}
