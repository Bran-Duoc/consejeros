-- ============================================================
-- Sede Viña del Mar — Add School and Career to Tickets
-- ============================================================

ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS escuela VARCHAR(255);
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS carrera VARCHAR(255);

-- Update existing tickets if possible (optional)
-- UPDATE public.tickets t SET escuela = u.escuela, carrera = u.carrera 
-- FROM public.users u WHERE t.estudiante_id = u.id;
