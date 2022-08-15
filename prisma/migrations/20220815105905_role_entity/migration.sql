/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "UserEntity" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "UserEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoleEntity" (
    "id" SERIAL NOT NULL,
    "name" "UserRoles" NOT NULL,

    CONSTRAINT "UserRoleEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRolesEntitiesToUserEntities" (
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "UserRolesEntitiesToUserEntities_pkey" PRIMARY KEY ("userId","roleId")
);

-- AddForeignKey
ALTER TABLE "UserRolesEntitiesToUserEntities" ADD CONSTRAINT "UserRolesEntitiesToUserEntities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRolesEntitiesToUserEntities" ADD CONSTRAINT "UserRolesEntitiesToUserEntities_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRoleEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
