/*
  Warnings:

  - You are about to drop the `CategoriesOnPosts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRoleEntity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRolesEntitiesToUserEntities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoriesOnPosts" DROP CONSTRAINT "CategoriesOnPosts_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CategoriesOnPosts" DROP CONSTRAINT "CategoriesOnPosts_postId_fkey";

-- DropForeignKey
ALTER TABLE "UserRolesEntitiesToUserEntities" DROP CONSTRAINT "UserRolesEntitiesToUserEntities_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserRolesEntitiesToUserEntities" DROP CONSTRAINT "UserRolesEntitiesToUserEntities_userId_fkey";

-- AlterTable
ALTER TABLE "UserEntity" ADD COLUMN     "roles" "UserRoles"[];

-- DropTable
DROP TABLE "CategoriesOnPosts";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "UserRoleEntity";

-- DropTable
DROP TABLE "UserRolesEntitiesToUserEntities";
