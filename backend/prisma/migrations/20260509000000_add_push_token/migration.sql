-- Add Expo push token storage for Phase 5 notifications.
ALTER TABLE "User" ADD COLUMN "pushToken" TEXT;
