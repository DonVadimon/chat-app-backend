/*
  Warnings:

  - You are about to drop the column `userEntityId` on the `ChatMessageEntity` table. All the data in the column will be lost.
  - Added the required column `authorEntityId` to the `ChatMessageEntity` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChatRoles" AS ENUM ('OWNER', 'MEMBER');

-- DropForeignKey
ALTER TABLE "ChatMessageEntity" DROP CONSTRAINT "ChatMessageEntity_userEntityId_fkey";

-- AlterTable
ALTER TABLE "ChatMessageEntity" DROP COLUMN "userEntityId",
ADD COLUMN     "authorEntityId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ChatPermissionsEntity" (
    "id" SERIAL NOT NULL,
    "role" "ChatRoles" NOT NULL,
    "userEntityId" INTEGER NOT NULL,
    "chatRoomEntityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatPermissionsEntity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatMessageEntity" ADD CONSTRAINT "ChatMessageEntity_authorEntityId_fkey" FOREIGN KEY ("authorEntityId") REFERENCES "UserEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatPermissionsEntity" ADD CONSTRAINT "ChatPermissionsEntity_userEntityId_fkey" FOREIGN KEY ("userEntityId") REFERENCES "UserEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatPermissionsEntity" ADD CONSTRAINT "ChatPermissionsEntity_chatRoomEntityId_fkey" FOREIGN KEY ("chatRoomEntityId") REFERENCES "ChatRoomEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
