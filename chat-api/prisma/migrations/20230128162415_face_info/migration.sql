-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateTable
CREATE TABLE "FaceInfoEntity" (
    "id" SERIAL NOT NULL,
    "age" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "leftEyeColor" TEXT NOT NULL,
    "rightEyeColor" TEXT NOT NULL,
    "hairColor" TEXT NOT NULL,
    "skinColor" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaceInfoEntity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FaceInfoEntity_userId_key" ON "FaceInfoEntity"("userId");

-- AddForeignKey
ALTER TABLE "FaceInfoEntity" ADD CONSTRAINT "FaceInfoEntity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
