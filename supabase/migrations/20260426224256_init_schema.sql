-- ============================================================
-- Sede Viña del Mar — Schema v2 (Full)
-- Ley 21.719 RLS Compliance
-- ============================================================

-- ============================================================
-- LIMPIEZA
-- ============================================================
DROP TABLE IF EXISTS public.surveys         CASCADE;
DROP TABLE IF EXISTS public.ticket_history  CASCADE;
DROP TABLE IF EXISTS public.ticket_comments CASCADE;
DROP TABLE IF EXISTS public.tickets         CASCADE;
DROP TABLE IF EXISTS public.users           CASCADE;

DROP FUNCTION IF EXISTS public.get_my_rol() CASCADE;

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
-- TABLE: users
-- ============================================================
CREATE TABLE public.users (
    id         UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rol        rol_usuario  NOT NULL DEFAULT 'Estudiante',
    escuela    VARCHAR,
    carrera    VARCHAR,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: tickets
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
-- TABLE: ticket_history (Auditoría)
-- ============================================================
CREATE TABLE public.ticket_history (
    id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id      UUID         NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    user_id        UUID         REFERENCES public.users(id) ON DELETE SET NULL,
    user_name      VARCHAR(255) NOT NULL,
    action         VARCHAR(100) NOT NULL,
    previous_state VARCHAR(100),
    new_state      VARCHAR(100),
    metadata       TEXT,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: surveys
-- ============================================================
CREATE TABLE public.surveys (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id   UUID         NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    user_id     UUID         NOT NULL REFERENCES public.users(id),
    csat_score  INTEGER      NOT NULL CHECK (csat_score BETWEEN 1 AND 5),
    ces_score   INTEGER      NOT NULL CHECK (ces_score BETWEEN 1 AND 7),
    comment     TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS CONFIGURATION
-- ============================================================
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys        ENABLE ROW LEVEL SECURITY;

-- Helper function (Security Definer)
CREATE OR REPLACE FUNCTION public.get_my_rol()
RETURNS rol_usuario
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol FROM public.users WHERE id = auth.uid();
$$;

-- Policies: users
CREATE POLICY "users: ver propio perfil" ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users: staff ve todos"   ON public.users FOR SELECT USING (public.get_my_rol() IN ('Consejero', 'Admin_TI'));
CREATE POLICY "users: gestionar propio" ON public.users FOR ALL    USING (id = auth.uid());

-- Policies: tickets (Ley 21.719)
CREATE POLICY "tickets: insert" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = estudiante_id);

CREATE POLICY "tickets: select no-bienestar" ON public.tickets FOR SELECT USING (
    categoria <> 'Bienestar' AND (auth.uid() = estudiante_id OR public.get_my_rol() IN ('Consejero', 'Admin_TI'))
);

CREATE POLICY "tickets: select bienestar" ON public.tickets FOR SELECT USING (
    categoria = 'Bienestar' AND (auth.uid() = estudiante_id OR public.get_my_rol() = 'Consejero')
);

CREATE POLICY "tickets: update staff" ON public.tickets FOR UPDATE USING (public.get_my_rol() IN ('Consejero', 'Admin_TI'));

-- Policies: ticket_history
CREATE POLICY "history: select" ON public.ticket_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id)
);
CREATE POLICY "history: insert" ON public.ticket_history FOR INSERT WITH CHECK (true);

-- Policies: surveys
CREATE POLICY "surveys: select" ON public.surveys FOR SELECT USING (auth.uid() = user_id OR public.get_my_rol() = 'Consejero');
CREATE POLICY "surveys: insert" ON public.surveys FOR INSERT WITH CHECK (auth.uid() = user_id);
