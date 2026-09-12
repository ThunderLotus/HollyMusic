-- Add role column with default 'user'
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';

-- Migrate existing admin user to admin role
UPDATE "User" SET "role" = 'admin' WHERE "username" = 'admin';