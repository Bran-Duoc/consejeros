-- ============================================================
-- [Bloque SQL] Restricción de dominio: @duoc.cl / @duocuc.cl
--
-- NOTA: Supabase no permite triggers directos en auth.users
-- desde migraciones. La validación se hace en dos capas:
--
-- Capa 1 (Backend): Esta función en public que se registra
--   como un Custom Auth Hook desde el Dashboard de Supabase
--   (Authentication > Hooks > "before_sign_in").
--
-- Capa 2 (Frontend): Validación en tiempo real en la UI
--   (app/login/page.tsx) que bloquea el botón antes de
--   enviar la petición al servidor.
-- ============================================================

-- Función que se registrará como Custom Hook en Supabase Auth
-- Dashboard path: Authentication → Hooks → before_sign_in
CREATE OR REPLACE FUNCTION public.restrict_institutional_email(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Extraer el email del payload del evento Auth
  user_email := event ->> 'email';

  -- Verificar que termine en @duoc.cl o @duocuc.cl
  IF user_email IS NULL
     OR (user_email NOT LIKE '%@duoc.cl'
         AND user_email NOT LIKE '%@duocuc.cl') THEN
    -- Devolver error en formato que Supabase Auth entiende
    RETURN jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message',   format(
          'Acceso denegado: solo se admiten correos @duoc.cl o @duocuc.cl. El correo "%s" no está autorizado.',
          COALESCE(user_email, '(vacío)')
        )
      )
    );
  END IF;

  -- Email válido: devolver el evento sin modificaciones
  RETURN event;
END;
$$;

-- Otorgar permisos de ejecución al rol de Supabase Auth
GRANT EXECUTE ON FUNCTION public.restrict_institutional_email(jsonb)
  TO supabase_auth_admin;

-- ============================================================
-- INSTRUCCIÓN POST-MIGRACIÓN (no se puede automatizar via CLI)
-- ============================================================
-- Después de aplicar esta migración, ve al Dashboard de Supabase:
-- Authentication → Hooks → "before_sign_in"
-- Selecciona: Hook type = "PostgreSQL Function"
-- Selecciona: Schema = public, Function = restrict_institutional_email
-- Guarda los cambios.
-- ============================================================
