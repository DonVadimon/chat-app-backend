import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { SearchMessagesParamsDto } from './dto/search-messages-params.dto';
import { SearchParamsDto } from './dto/search-params.dto';
import { ChatMessageEntitySearchItem, ChatRoomEntitySearchItem, UserEntitySearchItem } from './search.types';

@Injectable()
export class SearchService {
    constructor(private readonly prisma: PrismaService) {}

    private tsquerySpecialChars = /[()|&:*!]/g;

    private getQueryFromSearchPhrase = (searchPhrase: string) =>
        searchPhrase
            .replace(this.tsquerySpecialChars, ' ')
            .trim()
            .split(/\s+/)
            .map((part) => `${part}:*`)
            .join(' | ');

    searchUsers(searchParams: SearchParamsDto) {
        const query = this.getQueryFromSearchPhrase(searchParams.searchString);

        return this.prisma.$queryRaw<UserEntitySearchItem[]>`
        SELECT id, username, name, email FROM "UserEntity"
            WHERE "textSearch" @@ to_tsquery(${query})
            ORDER BY ts_rank("textSearch", to_tsquery(${query}))
            DESC
            OFFSET ${searchParams.offset}
            LIMIT ${searchParams.limit};
        `;
    }

    searchMessages(searchParams: SearchMessagesParamsDto, userId: number) {
        const query = this.getQueryFromSearchPhrase(searchParams.searchString);

        return this.prisma.$queryRaw<ChatMessageEntitySearchItem[]>`
        SELECT id, content, "chatRoomEntityId" FROM (
            SELECT * FROM public."ChatMessageEntity"
                INNER JOIN
                    (SELECT "A" AS room_id FROM public."_ChatRoomEntityToUserEntity"
                    WHERE public."_ChatRoomEntityToUserEntity"."B" = ${userId})
                    AS user_rooms_ids
                    ON user_rooms_ids.room_id = public."ChatMessageEntity"."chatRoomEntityId"
        ) AS user_rooms
            WHERE user_rooms."textSearch" @@ to_tsquery(${query})
            AND (CASE WHEN ${searchParams.chatId}::INT IS NOT NULL THEN user_rooms."chatRoomEntityId" = ${searchParams.chatId} ELSE true END)
            ORDER BY ts_rank(user_rooms."textSearch", to_tsquery(${query}))
            DESC
            OFFSET ${searchParams.offset}
            LIMIT ${searchParams.limit};
       `;
    }

    searchChats(searchParams: SearchParamsDto, userId: number) {
        const query = this.getQueryFromSearchPhrase(searchParams.searchString);

        return this.prisma.$queryRaw<ChatRoomEntitySearchItem[]>`
        SELECT id, type, name, description FROM (
            SELECT * FROM public."ChatRoomEntity"
	            INNER JOIN
		        (SELECT "A" as room_id FROM public."_ChatRoomEntityToUserEntity"
		        WHERE public."_ChatRoomEntityToUserEntity"."B" = ${userId})
                AS user_rooms_ids
	            ON user_rooms_ids.room_id = public."ChatRoomEntity".id
        ) AS user_rooms
            WHERE user_rooms."textSearch" @@ to_tsquery(${query})
            ORDER BY ts_rank(user_rooms."textSearch", to_tsquery(${query}))
            DESC
            OFFSET ${searchParams.offset}
            LIMIT ${searchParams.limit};
       `;
    }
}
