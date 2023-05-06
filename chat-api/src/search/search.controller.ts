import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RequestWithUser } from '@/auth/auth.types';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

import { SearchMessagesParamsDto } from './dto/search-messages-params.dto';
import { SearchParamsDto } from './dto/search-params.dto';
import { SearchService } from './search.service';
import {
    ApiChatMessageEntitySearchItemResponse,
    ApiChatRoomEntitySearchItemResponse,
    ApiUserEntitySearchItemResponse,
} from './search.swagger';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) {}

    @Post('users')
    @ApiOkResponse({ type: ApiUserEntitySearchItemResponse, isArray: true })
    searchUsers(@Body() searchParams: SearchParamsDto) {
        return this.searchService.searchUsers(searchParams);
    }

    @Post('messages')
    @ApiOkResponse({ type: ApiChatMessageEntitySearchItemResponse, isArray: true })
    searchMessages(@Req() { user }: RequestWithUser, @Body() searchParams: SearchMessagesParamsDto) {
        return this.searchService.searchMessages(searchParams, user.id);
    }

    @Post('chats')
    @ApiOkResponse({ type: ApiChatRoomEntitySearchItemResponse, isArray: true })
    searchChats(@Req() { user }: RequestWithUser, @Body() searchParams: SearchParamsDto) {
        return this.searchService.searchChats(searchParams, user.id);
    }
}
