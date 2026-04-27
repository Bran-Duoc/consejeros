-- ============================================================
-- Sede Viña del Mar — Add Missing Columns to Tickets
-- ============================================================

-- 1. Add asignado_a column (UUID)
-- This column was used in the code but missing in the migrations.
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS asignado_a UUID REFERENCES auth.users(id);

-- 2. Add index for performance
CREATE INDEX IF NOT EXISTS idx_tickets_asignado_a ON public.tickets(asignado_a);

-- 3. Ensure the schema cache is updated
NOTIFY pgrst, 'reload schema';
