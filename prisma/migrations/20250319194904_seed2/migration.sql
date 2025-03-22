/*
  Warnings:

  - Added the required column `radius` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "radius" DOUBLE PRECISION NOT NULL;
