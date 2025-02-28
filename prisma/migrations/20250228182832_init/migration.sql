/*
  Warnings:

  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `domain` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `mentorId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Project` table. All the data in the column will be lost.
  - The primary key for the `Task` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Task` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `duration` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Student', 'Mentor', 'Professor', 'Admin');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Open', 'Closed', 'InProgress');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'InterviewScheduled');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('Pending', 'InProgress', 'Completed');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('Unread', 'Read');

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_mentorId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP CONSTRAINT "Project_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "domain",
DROP COLUMN "id",
DROP COLUMN "mentorId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "field" TEXT NOT NULL,
ADD COLUMN     "mentor_id" INTEGER,
ADD COLUMN     "perks" TEXT,
ADD COLUMN     "professor_id" INTEGER,
ADD COLUMN     "project_id" SERIAL NOT NULL,
ADD COLUMN     "status" "ProjectStatus" NOT NULL,
ADD COLUMN     "tech_stack" TEXT[],
ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id");

-- AlterTable
ALTER TABLE "Task" DROP CONSTRAINT "Task_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "projectId",
DROP COLUMN "updatedAt",
ADD COLUMN     "assigned_to" INTEGER,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "project_id" INTEGER NOT NULL,
ADD COLUMN     "task_id" SERIAL NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL,
ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("task_id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "user_id" SERIAL NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("user_id");

-- CreateTable
CREATE TABLE "StudentProfile" (
    "student_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "skills" TEXT[],
    "experience" INTEGER NOT NULL,
    "branch" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "MentorProfile" (
    "mentor_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "skills" TEXT[],
    "experience" INTEGER NOT NULL,
    "branch" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "MentorProfile_pkey" PRIMARY KEY ("mentor_id")
);

-- CreateTable
CREATE TABLE "ProfessorProfile" (
    "professor_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "research_field" TEXT NOT NULL,
    "papers_published" TEXT[],

    CONSTRAINT "ProfessorProfile_pkey" PRIMARY KEY ("professor_id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "admin_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "permissions" TEXT[],

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "Application" (
    "application_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("application_id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "meeting_id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "professor_id" INTEGER,
    "student_id" INTEGER,
    "meeting_link" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("meeting_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_user_id_key" ON "StudentProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "MentorProfile_user_id_key" ON "MentorProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessorProfile_user_id_key" ON "ProfessorProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_user_id_key" ON "Admin"("user_id");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorProfile" ADD CONSTRAINT "MentorProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorProfile" ADD CONSTRAINT "ProfessorProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
