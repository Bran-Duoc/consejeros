-- ============================================================
-- Sincronización automática de Perfiles (auth.users -> public.users)
-- ============================================================

-- Función que maneja la inserción automática
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, rol)
  VALUES (new.id, 'Estudiante')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Trigger que se dispara después de un INSERT en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
