-- ============================================================
-- Sede Viña del Mar — RBAC RLS Update
-- Implement specific permissions for Supervisor, Consejo, Admin TI
-- ============================================================

-- 1. DROP old staff policies for tickets
DROP POLICY IF EXISTS "tickets: select no-bienestar" ON public.tickets;
DROP POLICY IF EXISTS "tickets: select bienestar"    ON public.tickets;
DROP POLICY IF EXISTS "tickets: update staff"      ON public.tickets;

-- 2. NEW POLICIES for public.tickets

-- SELECT: Supervisor and Admin TI see everything. Consejo sees everything too (active management).
-- Note: 'Admin_TI' is kept for legacy compatibility if needed, but we use the new names.
CREATE POLICY "tickets: staff_select" ON public.tickets FOR SELECT USING (
    auth.uid() = estudiante_id 
    OR public.get_my_rol() IN ('Supervisor', 'Consejo', 'Admin TI', 'Admin_TI')
);

-- UPDATE: Only Consejo and Admin TI can update tickets (resolve, escalate).
-- Supervisor is READ ONLY.
CREATE POLICY "tickets: staff_update" ON public.tickets FOR UPDATE USING (
    public.get_my_rol() IN ('Consejo', 'Admin TI', 'Admin_TI')
);

-- 3. POLICIES for staff_users (Safety)
DROP POLICY IF EXISTS "staff: ver perfiles" ON public.staff_users;
CREATE POLICY "staff: select_all" ON public.staff_users FOR SELECT USING (
    public.get_my_rol() IN ('Supervisor', 'Consejo', 'Admin TI', 'Admin_TI')
);

-- 4. POLICIES for ticket_history (Audit)
DROP POLICY IF EXISTS "history: select" ON public.ticket_history;
CREATE POLICY "history: staff_select" ON public.ticket_history FOR SELECT USING (
    public.get_my_rol() IN ('Supervisor', 'Consejo', 'Admin TI', 'Admin_TI')
);
