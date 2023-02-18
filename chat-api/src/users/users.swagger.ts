import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserEntity, UserRoles } from '@prisma/client';

import { ApiFaceInfoEntityResponse } from '@/face/face.swagger';
import { ApiFileEntityResponse } from '@/files/files.swagger';

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
    @ApiProperty()
    avatarFileEntityId: number | null;
    @ApiPropertyOptional({ type: ApiFileEntityResponse })
    avatar?: ApiFileEntityResponse | null;
}

export class ApiUserEntityWithFaceInfoResponse extends ApiUserEntityResponse {
    @ApiPropertyOptional({ type: ApiFaceInfoEntityResponse })
    faceInfo?: ApiFaceInfoEntityResponse | null;
}

export class ApiCheckUsernameAvailableResponse {
    @ApiProperty()
    available: boolean;
}
