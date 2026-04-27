-- ============================================================
-- Sede Viña del Mar — Role Refactor Migration
-- Update roles to: Supervisor, Consejo, Admin TI
-- ============================================================

-- 1. Add new roles to the enum (cannot be undone easily)
ALTER TYPE public.rol_usuario ADD VALUE IF NOT EXISTS 'Supervisor';
ALTER TYPE public.rol_usuario ADD VALUE IF NOT EXISTS 'Consejo';
-- We keep 'Admin_TI' but the user wants 'Admin TI' (with space)? 
-- Enum values usually don't have spaces for ease of use in code, 
-- but I can add it if they really want. However, 'Admin_TI' is already there.
-- I will add 'Admin TI' as well or just map it in UI.
-- Actually, I'll add 'Admin TI' to be literal.
ALTER TYPE public.rol_usuario ADD VALUE IF NOT EXISTS 'Admin TI';

-- 2. Update existing staff roles
UPDATE public.staff_users SET rol = 'Consejo' WHERE rol = 'Consejero';
UPDATE public.staff_users SET rol = 'Admin TI' WHERE rol = 'Admin_TI';

-- 3. Update staff_users constraint
ALTER TABLE public.staff_users DROP CONSTRAINT IF EXISTS staff_only;
ALTER TABLE public.staff_users ADD CONSTRAINT staff_only CHECK (rol IN ('Supervisor', 'Consejo', 'Admin TI', 'Admin_TI'));

-- 4. Update the helper function to reflect new roles if needed
-- (The logic remains the same: check staff_users then users)
