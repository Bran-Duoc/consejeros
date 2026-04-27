-- ============================================================
-- Sede Viña del Mar — Fix Audit System ID
-- Ensure ticket_history.user_id can be null for system actions
-- ============================================================

-- 1. Ensure user_id is nullable (it should be, but let's be explicit)
ALTER TABLE public.ticket_history 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Ensure any existing "system" strings (if they were somehow bypassed) don't exist
-- No action needed as the column is UUID type and would have failed earlier.
