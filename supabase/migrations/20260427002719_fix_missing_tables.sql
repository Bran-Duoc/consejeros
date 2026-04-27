-- ============================================================
-- FIX: Restaurar tablas faltantes para evitar errores en el AppContext
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ticket_history (
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

CREATE TABLE IF NOT EXISTS public.surveys (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id   UUID         NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    user_id     UUID         NOT NULL REFERENCES public.users(id),
    csat_score  INTEGER      NOT NULL CHECK (csat_score BETWEEN 1 AND 5),
    ces_score   INTEGER      NOT NULL CHECK (ces_score BETWEEN 1 AND 7),
    comment     TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys        ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "history: select" ON public.ticket_history FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "history: insert" ON public.ticket_history FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "surveys: select" ON public.surveys FOR SELECT USING (auth.uid() = user_id OR public.get_my_rol() = 'Consejero');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "surveys: insert" ON public.surveys FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
