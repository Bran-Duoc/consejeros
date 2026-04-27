-- ============================================================
-- Sede Viña del Mar — Fix Ticket Foreign Key
-- Allow any auth user to create tickets (Students & Staff)
-- ============================================================

-- 1. Identify and drop the old constraint
ALTER TABLE public.tickets 
DROP CONSTRAINT IF EXISTS tickets_estudiante_id_fkey;

-- 2. Add the new constraint referencing auth.users directly
ALTER TABLE public.tickets
ADD CONSTRAINT tickets_estudiante_id_fkey 
FOREIGN KEY (estudiante_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 3. Ensure the check policy for insert is still valid (it should be)
-- POLICY "tickets: insert" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = estudiante_id);
-- No changes needed here as it already uses auth.uid().
