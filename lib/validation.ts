// ============================================================
// Form Validation Schemas (Zod v4) — Portal Hub del Consejo de Sede
// All messages in Spanish for student-facing UX
// ============================================================

import { z } from 'zod';

// ---- Solicitud Form Schema ----
export const solicitudSchema = z.object({
  category: z.enum(['academico', 'infraestructura', 'bienestar', 'financiero', 'otro']).catch('academico'),
  title: z
    .string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(100, 'El título no puede superar los 100 caracteres'),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede superar los 2000 caracteres'),
  urgency: z.enum(['bajo', 'medio', 'alto', 'critico']).catch('bajo'),
  name: z
    .string()
    .min(2, 'Ingresa tu nombre completo (mínimo 2 caracteres)')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  email: z
    .string()
    .email('Ingresa un email válido'),
  school: z.string().min(1, 'Selecciona tu escuela'),
  career: z.string().min(1, 'Selecciona tu carrera'),
  arcoConsent: z.boolean(),
});

export type SolicitudFormData = z.infer<typeof solicitudSchema>;

// ---- Step-by-step validation ----
export function validateStep(step: number, data: Record<string, any>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 0) {
    if (!data.category) errors.category = 'Selecciona una categoría';
  } else if (step === 1) {
    if (!data.name || data.name.length < 2) errors.name = 'Ingresa tu nombre completo (mínimo 2 caracteres)';
    if (!data.email) {
      errors.email = 'Ingresa un email válido';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Ingresa un email válido';
    } else if (!/(@duoc(uc)?\.cl)$/i.test(data.email)) {
      errors.email = 'Debes usar tu correo institucional (@duocuc.cl o @duoc.cl)';
    }
    if (!data.school) errors.school = 'Selecciona tu escuela';
    if (!data.career) errors.career = 'Selecciona tu carrera';
    if (!data.title || data.title.length < 5) errors.title = 'El título debe tener al menos 5 caracteres';
    if (data.title && data.title.length > 100) errors.title = 'El título no puede superar los 100 caracteres';
    if (!data.description || data.description.length < 10) errors.description = 'La descripción debe tener al menos 10 caracteres';
    if (data.description && data.description.length > 2000) errors.description = 'La descripción no puede superar los 2000 caracteres';
  } else if (step === 2) {
    if (!data.urgency) errors.urgency = 'Selecciona un nivel de urgencia';
  } else if (step === 3) {
    if (!data.arcoConsent) errors.arcoConsent = 'Debes aceptar el consentimiento ARCO para enviar la solicitud';
  }

  return errors;
}

// ---- Sanitize text input ----
export function sanitizeInput(text: string): string {
  return text
    .replace(/[<>{}]/g, '') // Remove potential XSS characters
    .trim();
}
