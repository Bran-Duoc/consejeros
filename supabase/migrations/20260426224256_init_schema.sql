-- ============================================================
-- Sede Viña del Mar — Schema v2
-- Ley 21.719 RLS Compliance
-- Drop & Recreate para reemplazar el esquema inicial.
-- ============================================================

-- ============================================================
-- LIMPIEZA DEL ESQUEMA ANTERIOR
-- ============================================================
DROP TABLE IF EXISTS public.surveys        CASCADE;
DROP TABLE IF EXISTS public.ticket_history CASCADE;
DROP TABLE IF EXISTS public.ticket_comments CASCADE;
DROP TABLE IF EXISTS public.tickets        CASCADE;
DROP TABLE IF EXISTS public.users          CASCADE;
DROP TABLE IF EXISTS public.sla_config     CASCADE;
DROP TABLE IF EXISTS public.faq_articles   CASCADE;
DROP TABLE IF EXISTS public.roadmap_items  CASCADE;

DROP VIEW IF EXISTS public.v_avg_resolution_time CASCADE;
DROP VIEW IF EXISTS public.v_fcr_rate            CASCADE;
DROP VIEW IF EXISTS public.v_satisfaction_scores CASCADE;

DROP FUNCTION IF EXISTS public.update_updated_at()        CASCADE;
DROP FUNCTION IF EXISTS public.log_ticket_status_change() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_rol()               CASCADE;

DROP TYPE IF EXISTS public.rol_usuario      CASCADE;
DROP TYPE IF EXISTS public.estado_ticket    CASCADE;
DROP TYPE IF EXISTS public.urgencia_ticket  CASCADE;
DROP TYPE IF EXISTS public.categoria_ticket CASCADE;

-- ============================================================
-- ENUMs
-- ============================================================
CREATE TYPE rol_usuario      AS ENUM ('Estudiante', 'Consejero', 'Admin_TI');
CREATE TYPE estado_ticket    AS ENUM ('Nuevo', 'Pendiente', 'En revisión', 'Escalado', 'Resuelto');
CREATE TYPE urgencia_ticket  AS ENUM ('Bajo', 'Medio', 'Alto', 'Crítico');
CREATE TYPE categoria_ticket AS ENUM ('Académico', 'Infraestructura', 'Bienestar', 'Financiero', 'Otros');

-- ============================================================
-- TABLE: users (Perfiles extendidos de auth.users)
-- ============================================================
CREATE TABLE public.users (
    id         UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rol        rol_usuario  NOT NULL DEFAULT 'Estudiante',
    escuela    VARCHAR,
    carrera    VARCHAR,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: tickets (Solicitudes estudiantiles)
-- ============================================================
CREATE TABLE public.tickets (
    id             UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id  UUID             NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    titulo         VARCHAR(100)     NOT NULL,
    descripcion    TEXT,
    categoria      categoria_ticket NOT NULL,
    nivel_urgencia urgencia_ticket  NOT NULL,
    estado         estado_ticket    NOT NULL DEFAULT 'Nuevo',
    fecha_creacion TIMESTAMPTZ      NOT NULL DEFAULT now(),
    sla_deadline   TIMESTAMPTZ      NOT NULL
);

-- ============================================================
-- SECURITY DEFINER HELPER — evita recursión en RLS
-- Obtiene el rol del usuario auth actual sin activar las
-- policies de la tabla users (corre como owner de la DB).
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_rol()
RETURNS rol_usuario
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol FROM public.users WHERE id = auth.uid();
$$;

-- ============================================================
-- HABILITAR RLS
-- ============================================================
ALTER TABLE public.users   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: users
-- ============================================================

-- Cada usuario lee su propio perfil
CREATE POLICY "users: ver propio perfil"
ON public.users FOR SELECT
USING (id = auth.uid());

-- Consejeros y Admin_TI ven todos los perfiles (no bienestar tickets)
CREATE POLICY "users: staff ve todos"
ON public.users FOR SELECT
USING (public.get_my_rol() IN ('Consejero', 'Admin_TI'));

-- Cada usuario gestiona solo su propio perfil
CREATE POLICY "users: gestionar propio perfil"
ON public.users FOR ALL
USING (id = auth.uid());

-- ============================================================
-- POLICIES: tickets
-- ============================================================

-- INSERT: cualquier usuario autenticado puede abrir un ticket
CREATE POLICY "tickets: estudiante puede crear"
ON public.tickets FOR INSERT
WITH CHECK (auth.uid() = estudiante_id);

-- SELECT (NO Bienestar): creador + Consejero + Admin_TI
CREATE POLICY "tickets: acceso general no-bienestar"
ON public.tickets FOR SELECT
USING (
    categoria <> 'Bienestar'
    AND (
        auth.uid() = estudiante_id
        OR public.get_my_rol() IN ('Consejero', 'Admin_TI')
    )
);

-- SELECT (Bienestar — Ley 21.719):
-- SOLO el creador y Consejeros. Admin_TI EXCLUIDO explícitamente.
CREATE POLICY "tickets: bienestar solo creador y consejero (Ley 21.719)"
ON public.tickets FOR SELECT
USING (
    categoria = 'Bienestar'
    AND (
        auth.uid() = estudiante_id
        OR public.get_my_rol() = 'Consejero'
    )
);

-- UPDATE: solo Consejeros pueden gestionar tickets
CREATE POLICY "tickets: consejero puede actualizar"
ON public.tickets FOR UPDATE
USING (public.get_my_rol() = 'Consejero');
