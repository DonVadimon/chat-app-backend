-- DropForeignKey
ALTER TABLE "ChatMessageEntity" DROP CONSTRAINT "ChatMessageEntity_chatRoomEntityId_fkey";

-- DropForeignKey
ALTER TABLE "ChatPermissionsEntity" DROP CONSTRAINT "ChatPermissionsEntity_chatRoomEntityId_fkey";

-- AddForeignKey
ALTER TABLE "ChatMessageEntity" ADD CONSTRAINT "ChatMessageEntity_chatRoomEntityId_fkey" FOREIGN KEY ("chatRoomEntityId") REFERENCES "ChatRoomEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatPermissionsEntity" ADD CONSTRAINT "ChatPermissionsEntity_chatRoomEntityId_fkey" FOREIGN KEY ("chatRoomEntityId") REFERENCES "ChatRoomEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
