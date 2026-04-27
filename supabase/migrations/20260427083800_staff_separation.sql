-- ============================================================
-- Sede Viña del Mar — Staff Separation Migration
-- Create a dedicated table for Staff (Admin/Consejeros)
-- ============================================================

-- 1. Create the staff_users table
CREATE TABLE public.staff_users (
    id         UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rol        rol_usuario  NOT NULL DEFAULT 'Consejero',
    nombre     VARCHAR(255),
    departamento VARCHAR(255),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT staff_only CHECK (rol IN ('Consejero', 'Admin_TI'))
);

-- 2. Move existing staff from public.users to public.staff_users (if any)
INSERT INTO public.staff_users (id, rol, created_at)
SELECT id, rol, created_at FROM public.users WHERE rol IN ('Consejero', 'Admin_TI')
ON CONFLICT (id) DO NOTHING;

-- 3. Remove staff from public.users to ensure clean separation
DELETE FROM public.users WHERE rol IN ('Consejero', 'Admin_TI');

-- 4. Enable RLS
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- 5. Policies for staff_users
CREATE POLICY "staff: ver perfiles de staff" ON public.staff_users FOR SELECT USING (true);
CREATE POLICY "staff: gestionar propio perfil" ON public.staff_users FOR ALL USING (id = auth.uid());

-- 6. Update the get_my_rol function to check both tables
CREATE OR REPLACE FUNCTION public.get_my_rol()
RETURNS rol_usuario
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    found_rol rol_usuario;
BEGIN
    -- Primero buscamos en staff
    SELECT rol INTO found_rol FROM public.staff_users WHERE id = auth.uid();
    
    IF found_rol IS NOT NULL THEN
        RETURN found_rol;
    END IF;

    -- Si no, buscamos en usuarios normales
    SELECT rol INTO found_rol FROM public.users WHERE id = auth.uid();
    
    RETURN COALESCE(found_rol, 'Estudiante'::rol_usuario);
END;
$$;
