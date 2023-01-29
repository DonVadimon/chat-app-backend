import { IsInt, IsOptional, IsPositive } from 'class-validator';

import { SearchParamsDto } from './search-params.dto';

export class SearchMessagesParamsDto extends SearchParamsDto {
    @IsInt()
    @IsPositive()
    @IsOptional()
    chatId?: number;
}
