-- ============================================================
-- Sede Viña del Mar — Final Schema Fixes
-- Add missing columns and performance optimizations
-- ============================================================

-- 1. Add missing columns to tickets
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Apply trigger to tickets
DROP TRIGGER IF EXISTS set_updated_at ON public.tickets;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Add performance indexes for "Massive Usage"
CREATE INDEX IF NOT EXISTS idx_tickets_estudiante_id ON public.tickets(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON public.tickets(estado);
CREATE INDEX IF NOT EXISTS idx_tickets_categoria ON public.tickets(categoria);
CREATE INDEX IF NOT EXISTS idx_tickets_fecha_creacion ON public.tickets(fecha_creacion DESC);

-- 5. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
