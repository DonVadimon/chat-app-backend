-- AlterTable
ALTER TABLE "UserEntity" ADD COLUMN "avatarFileEntityId" INTEGER;

-- CreateTable
CREATE TABLE "FileEntity" (
    "id" SERIAL NOT NULL,
    "originalName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileEntity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserEntity" ADD CONSTRAINT "UserEntity_avatarFileEntityId_fkey" FOREIGN KEY ("avatarFileEntityId") REFERENCES "FileEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
