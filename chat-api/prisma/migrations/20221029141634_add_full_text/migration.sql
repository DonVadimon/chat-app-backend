-- AlterTable

ALTER TABLE
    "ChatMessageEntity"
ADD
    COLUMN "textSearch" TSVECTOR GENERATED ALWAYS AS (
        setweight(
            to_tsvector(
                'english',
                coalesce("content", '')
            ),
            'A'
        )
    ) STORED;

-- AlterTable

ALTER TABLE "ChatRoomEntity"
ADD
    COLUMN "textSearch" TSVECTOR GENERATED ALWAYS AS (
        setweight(
            to_tsvector(
                'english',
                coalesce("name", '')
            ),
            'A'
        ) || setweight(
            to_tsvector(
                'english',
                coalesce("description", '')
            ),
            'B'
        )
    ) STORED;

-- AlterTable

ALTER TABLE "UserEntity"
ADD
    COLUMN "textSearch" TSVECTOR GENERATED ALWAYS AS (
        setweight(
            to_tsvector(
                'english',
                coalesce("username", '')
            ),
            'A'
        ) || setweight(
            to_tsvector(
                'english',
                coalesce("name", '')
            ),
            'B'
        ) || setweight(
            to_tsvector(
                'english',
                coalesce("email", '')
            ),
            'C'
        )
    ) STORED;

-- CreateIndex

CREATE INDEX
    "ChatMessageEntity_textSearch_idx" ON "ChatMessageEntity" USING GIN ("textSearch");

-- CreateIndex

CREATE INDEX
    "ChatRoomEntity_textSearch_idx" ON "ChatRoomEntity" USING GIN ("textSearch");

-- CreateIndex

CREATE INDEX
    "UserEntity_textSearch_idx" ON "UserEntity" USING GIN ("textSearch");
