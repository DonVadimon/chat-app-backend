-- CreateEnum
CREATE TYPE "ChatRoomType" AS ENUM ('PRIVATE', 'GROUP');

-- CreateTable
CREATE TABLE "ChatRoomEntity" (
    "id" SERIAL NOT NULL,
    "type" "ChatRoomType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatRoomEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessageEntity" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "chatRoomEntityId" INTEGER NOT NULL,
    "userEntityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatMessageEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChatRoomEntityToUserEntity" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChatRoomEntityToUserEntity_AB_unique" ON "_ChatRoomEntityToUserEntity"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatRoomEntityToUserEntity_B_index" ON "_ChatRoomEntityToUserEntity"("B");

-- AddForeignKey
ALTER TABLE "ChatMessageEntity" ADD CONSTRAINT "ChatMessageEntity_chatRoomEntityId_fkey" FOREIGN KEY ("chatRoomEntityId") REFERENCES "ChatRoomEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessageEntity" ADD CONSTRAINT "ChatMessageEntity_userEntityId_fkey" FOREIGN KEY ("userEntityId") REFERENCES "UserEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomEntityToUserEntity" ADD CONSTRAINT "_ChatRoomEntityToUserEntity_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoomEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomEntityToUserEntity" ADD CONSTRAINT "_ChatRoomEntityToUserEntity_B_fkey" FOREIGN KEY ("B") REFERENCES "UserEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
