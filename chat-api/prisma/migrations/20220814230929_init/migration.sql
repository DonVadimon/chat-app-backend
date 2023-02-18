-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('ADMIN', 'REGULAR');

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roles" "UserRoles" NOT NULL DEFAULT 'REGULAR',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
