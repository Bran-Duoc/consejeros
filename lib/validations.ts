// ============================================================
// Centralized Validation Schemas (Zod v4)
// Portal Hub del Consejo de Sede — Consejeros de Carrera
// Single source of truth for all form validation
// ============================================================

import { z } from "zod";
import { TICKET_CATEGORIES, URGENCY_LEVELS } from "@/lib/data";

// ---- Sanitization helpers ----
function stripDangerousChars(text: string): string {
  return text.replace(/[<>{}]/g, "");
}

function sanitizeAndTrim(text: string): string {
  return text.replace(/[<>{}]/g, "").trim();
}

// ---- Master Schema ----
export const solicitudSchema = z.object({
  category: z.enum(TICKET_CATEGORIES, {
    error: "Selecciona una categoría",
  }),
  subcategory: z.string().min(1, "Selecciona una subcategoría"),
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(100, "El título no puede superar los 100 caracteres")
    .transform(stripDangerousChars),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(2000, "La descripción no puede superar los 2000 caracteres")
    .transform(stripDangerousChars),
  urgency: z.enum(URGENCY_LEVELS, {
    error: "Selecciona un nivel de urgencia",
  }),
  name: z
    .string()
    .min(2, "Ingresa tu nombre completo (mínimo 2 caracteres)")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  email: z
    .string()
    .email("Ingresa un email válido")
    .refine(
      (email) => {
        const isLocal = typeof window !== "undefined"
          ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          : process.env.NODE_ENV === "development";
        if (isLocal && (email.endsWith("@localhost") || email.endsWith("@example.com"))) {
          return true;
        }
        return /(@duoc(uc)?\.cl)$/i.test(email);
      },
      "Debes usar tu correo institucional (@duocuc.cl o @duoc.cl)"
    ),
  school: z.string().min(1, "Selecciona tu escuela"),
  career: z.string().min(1, "Selecciona tu carrera"),
  arcoConsent: z.boolean(),
});

// ---- Inferred Types ----
export type SolicitudFormData = z.infer<typeof solicitudSchema>;

// Input type (before transforms)
export type SolicitudFormInput = z.input<typeof solicitudSchema>;

// ---- Per-Step Validation ----
// Step 0: Category selection
const step0Schema = z.object({
  category: z.enum(TICKET_CATEGORIES, {
    error: "Selecciona una categoría",
  }),
  subcategory: z.string().min(1, "Selecciona una subcategoría"),
});

// Step 1: Personal details + ticket info
const step1Schema = z.object({
  name: solicitudSchema.shape.name,
  email: solicitudSchema.shape.email,
  school: solicitudSchema.shape.school,
  career: solicitudSchema.shape.career,
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(100, "El título no puede superar los 100 caracteres"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(2000, "La descripción no puede superar los 2000 caracteres"),
});

// Step 2: Urgency
const step2Schema = z.object({
  urgency: z.enum(URGENCY_LEVELS, {
    error: "Selecciona un nivel de urgencia",
  }),
});

// Step 3: Review + ARCO consent
const step3Schema = z.object({
  arcoConsent: z
    .boolean()
    .refine((v) => v === true, "Debes aceptar el consentimiento ARCO para enviar la solicitud"),
});

export const stepSchemas = [step0Schema, step1Schema, step2Schema, step3Schema] as const;

// ---- Step-level validation using safeParse + flatten ----
export function validateStep(
  step: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): Record<string, string> {
  const schema = stepSchemas[step];
  if (!schema) return {};

  const result = schema.safeParse(data);
  if (result.success) return {};

  const flat = result.error.flatten();
  const errors: Record<string, string> = {};

  for (const [field, messages] of Object.entries(flat.fieldErrors)) {
    if (messages && messages.length > 0) {
      errors[field] = messages[0];
    }
  }

  return errors;
}

// ---- Full form validation for submit ----
export function validateFullForm(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): { success: true; data: SolicitudFormData } | { success: false; errors: Record<string, string> } {
  const result = solicitudSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const flat = result.error.flatten();
  const errors: Record<string, string> = {};

  for (const [field, messages] of Object.entries(flat.fieldErrors)) {
    if (messages && messages.length > 0) {
      errors[field] = messages[0];
    }
  }

  return { success: false, errors };
}

// ---- Sanitize for real-time input (no trim, just strip dangerous) ----
export function sanitizeInput(text: string): string {
  return stripDangerousChars(text);
}

// ---- Sanitize at submit time (trim + strip) ----
export function sanitizeForSubmit(text: string): string {
  return sanitizeAndTrim(text);
}

// ---- Field names for RHF trigger() by step ----
export const STEP_FIELDS: readonly (readonly string[])[] = [
  ["category", "subcategory"],
  ["name", "email", "school", "career", "title", "description"],
  ["urgency"],
  ["arcoConsent"],
] as const;
