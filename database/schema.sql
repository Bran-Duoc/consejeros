-- ============================================================
-- Portal Hub del Consejo de Sede — Database Schema
-- PostgreSQL / Supabase Compatible
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('estudiante', 'consejero', 'trabajador', 'directora', 'admin')),
    department VARCHAR(100),
    avatar_url TEXT,
    active_tickets INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- TICKETS (Solicitudes)
-- ============================================================
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('academico', 'infraestructura', 'bienestar', 'financiero', 'otro')),
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('bajo', 'medio', 'alto', 'critico')),
    status VARCHAR(30) NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'pendiente', 'en_revision', 'escalado', 'resuelto')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_by_name VARCHAR(255) NOT NULL,
    sla_deadline TIMESTAMPTZ NOT NULL,
    attachments JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    is_stale BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    first_response_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_tickets_urgency ON tickets(urgency);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_sla_deadline ON tickets(sla_deadline);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);

-- ============================================================
-- TICKET HISTORY (Audit Trail / Trazabilidad)
-- ============================================================
CREATE TABLE ticket_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    previous_state VARCHAR(100),
    new_state VARCHAR(100),
    metadata TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_history_ticket_id ON ticket_history(ticket_id);
CREATE INDEX idx_ticket_history_user_id ON ticket_history(user_id);
CREATE INDEX idx_ticket_history_created_at ON ticket_history(created_at);

-- ============================================================
-- TICKET COMMENTS (Comunicaciones)
-- ============================================================
CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- internal notes vs student-facing
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);

-- ============================================================
-- SLA CONFIGURATION
-- ============================================================
CREATE TABLE sla_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    max_hours INTEGER NOT NULL,
    alert_at_50 BOOLEAN DEFAULT FALSE,
    alert_at_75 BOOLEAN DEFAULT TRUE,
    alert_at_90 BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (category, urgency)
);

-- ============================================================
-- FAQ ARTICLES (Base de Conocimientos)
-- ============================================================
CREATE TABLE faq_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_faq_articles_category ON faq_articles(category);

-- ============================================================
-- SURVEYS (Encuestas CSAT / CES)
-- ============================================================
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    csat_score INTEGER NOT NULL CHECK (csat_score BETWEEN 1 AND 5),
    ces_score INTEGER NOT NULL CHECK (ces_score BETWEEN 1 AND 7),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_surveys_ticket_id ON surveys(ticket_id);

-- ============================================================
-- ROADMAP ITEMS (Proyectos Públicos del Consejo)
-- ============================================================
CREATE TABLE roadmap_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'planificacion' CHECK (status IN ('planificacion', 'ejecucion', 'logrado')),
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VIEWS (for Analytics)
-- ============================================================

-- Average Resolution Time
CREATE VIEW v_avg_resolution_time AS
SELECT
    category,
    urgency,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) AS avg_hours,
    COUNT(*) AS total_resolved
FROM tickets
WHERE status = 'resuelto' AND resolved_at IS NOT NULL
GROUP BY category, urgency;

-- First Contact Resolution Rate
CREATE VIEW v_fcr_rate AS
SELECT
    COUNT(*) FILTER (WHERE first_response_at IS NOT NULL AND resolved_at IS NOT NULL
        AND resolved_at - first_response_at < INTERVAL '1 hour') AS fcr_count,
    COUNT(*) FILTER (WHERE status = 'resuelto') AS total_resolved,
    CASE
        WHEN COUNT(*) FILTER (WHERE status = 'resuelto') > 0
        THEN ROUND(
            COUNT(*) FILTER (WHERE first_response_at IS NOT NULL AND resolved_at IS NOT NULL
                AND resolved_at - first_response_at < INTERVAL '1 hour')::NUMERIC
            / COUNT(*) FILTER (WHERE status = 'resuelto')::NUMERIC * 100, 1
        )
        ELSE 0
    END AS fcr_percentage
FROM tickets;

-- CSAT / CES Averages
CREATE VIEW v_satisfaction_scores AS
SELECT
    ROUND(AVG(csat_score)::NUMERIC, 2) AS avg_csat,
    ROUND(AVG(ces_score)::NUMERIC, 2) AS avg_ces,
    COUNT(*) AS total_responses
FROM surveys;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_sla_config_updated_at BEFORE UPDATE ON sla_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_faq_articles_updated_at BEFORE UPDATE ON faq_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_roadmap_items_updated_at BEFORE UPDATE ON roadmap_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create audit entry on ticket status change
CREATE OR REPLACE FUNCTION log_ticket_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO ticket_history (ticket_id, user_id, user_name, action, previous_state, new_state)
        VALUES (NEW.id, NULL, 'Sistema', 'Cambio de estado', OLD.status, NEW.status);
    END IF;
    IF NEW.status = 'resuelto' AND OLD.status != 'resuelto' THEN
        NEW.resolved_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_ticket_status_audit BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION log_ticket_status_change();
