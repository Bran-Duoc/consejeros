"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import Footer from "@/components/Footer";

export default function PrivacidadPage() {
  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col bg-transparent">
      <main className="flex-1 overflow-y-auto custom-scrollbar pt-4 sm:pt-[85px] pb-20 sm:pb-12 px-4 sm:px-6">
        <article className="max-w-3xl mx-auto py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors mb-6">
              <Icon icon="lucide:arrow-left" className="w-4 h-4" />
              Volver al Inicio
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Icon icon="lucide:shield" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Política de Privacidad</h1>
                <p className="text-xs sm:text-sm text-foreground/50 font-medium">Última actualización: 27 de abril de 2026</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-foreground/80">
            
            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">1. Introducción</h2>
              <p>
                El Portal Hub del Consejo de Sede — Sede Viña del Mar, operado por el Consejo de Representación Estudiantil de Duoc UC, 
                se compromete a proteger la privacidad y los datos personales de todos los usuarios que interactúan con esta plataforma. 
                Esta política describe cómo recopilamos, usamos, almacenamos y protegemos su información en cumplimiento irrestricto 
                de la <strong>Ley N° 21.719 sobre Protección de Datos Personales</strong> de Chile.
              </p>
              <p className="mt-3">
                Al utilizar esta plataforma, usted acepta las prácticas descritas en esta política. Si no está de acuerdo con alguna 
                de las condiciones aquí expuestas, le recomendamos no utilizar el servicio.
              </p>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">2. Responsable del Tratamiento</h2>
              <p>
                El responsable del tratamiento de sus datos personales es el <strong>Consejo de Sede de Duoc UC — Sede Viña del Mar</strong>, 
                actuando como puente digital oficial entre el alumnado y la representación estudiantil institucional. 
                La plataforma es administrada conjuntamente por los Consejeros de Carrera electos, el Trabajador designado por Duoc UC 
                y la Dirección de Sede.
              </p>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">3. Datos que Recopilamos</h2>
              <p className="mb-3">Al utilizar el Portal, recopilamos las siguientes categorías de información:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:check-circle" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span><strong>Datos de identificación:</strong> Nombre completo y correo electrónico institucional (@duocuc.cl), proporcionados automáticamente a través de la autenticación con Google Workspace institucional (SSO).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:check-circle" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span><strong>Datos de la solicitud:</strong> Categoría del requerimiento (académico, infraestructura, bienestar, financiero u otro), descripción del problema, nivel de urgencia y archivos adjuntos opcionales.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:check-circle" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span><strong>Datos de satisfacción:</strong> Calificaciones CSAT y comentarios voluntarios enviados a través de las encuestas post-resolución.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:check-circle" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span><strong>Datos técnicos:</strong> Información del dispositivo, dirección IP aproximada, tipo de navegador y datos de uso anónimos para mejorar el rendimiento de la PWA.</span>
                </li>
              </ul>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">4. Finalidad del Tratamiento</h2>
              <p className="mb-3">Utilizamos sus datos personales exclusivamente para los siguientes fines:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:target" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span>Gestionar, asignar, dar seguimiento y resolver sus solicitudes estudiantiles a través del sistema Kanban interno.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:target" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span>Verificar su identidad como miembro activo de la comunidad estudiantil de Duoc UC Sede Viña del Mar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:target" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span>Generar métricas de transparencia agregadas y anónimas (ej. &quot;150 solicitudes resueltas este semestre&quot;) para el Tablero Público.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:target" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span>Monitorear indicadores de desempeño (MTTR, CSAT, NPS) para la mejora continua de los procesos del Consejo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:target" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span>Cumplir con obligaciones institucionales y normativas vigentes.</span>
                </li>
              </ul>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">5. Base Legal del Tratamiento</h2>
              <p>
                El tratamiento de sus datos se fundamenta en el <strong>consentimiento explícito</strong> otorgado al momento de iniciar sesión 
                con su cuenta institucional y al aceptar las condiciones del servicio. Para solicitudes de categoría &quot;bienestar&quot; 
                que involucren datos sensibles (salud mental, orientación, apoyo social), se aplican medidas de protección reforzada 
                conforme a la Ley 21.719, incluyendo el enmascaramiento automático de datos para roles de administración técnica (Admin_TI).
              </p>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">6. Derechos ARCO del Titular</h2>
              <p className="mb-3">
                De conformidad con la Ley 21.719, usted tiene los siguientes derechos sobre sus datos personales:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { letter: "A", title: "Acceso", desc: "Consultar qué datos personales tenemos sobre usted y el estado de sus solicitudes a través de su Portal Personal (/perfil)." },
                  { letter: "R", title: "Rectificación", desc: "Solicitar la corrección de datos inexactos o incompletos asociados a su cuenta o solicitudes." },
                  { letter: "C", title: "Cancelación", desc: "Solicitar la eliminación de sus datos personales cuando ya no sean necesarios para los fines descritos." },
                  { letter: "O", title: "Oposición", desc: "Oponerse al tratamiento de sus datos en cualquier momento, salvo que existan motivos legítimos." },
                ].map((right) => (
                  <div key={right.letter} className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">{right.letter}</span>
                      <h4 className="font-bold text-indigo-900">{right.title}</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70">{right.desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-foreground/60">
                Para ejercer estos derechos, puede contactarnos mediante una solicitud formal a través de la propia plataforma o 
                escribiendo a la dirección de correo electrónico del Consejo de Sede.
              </p>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">7. Almacenamiento y Seguridad</h2>
              <p>
                Sus datos son almacenados en infraestructura de <strong>Supabase</strong> (PostgreSQL), con servidores ubicados en la región 
                de Sudamérica. Implementamos las siguientes medidas de seguridad:
              </p>
              <ul className="mt-3 space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:lock" className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                  <span>Autenticación SSO institucional mediante Google Workspace (OAuth 2.0).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:lock" className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                  <span>Cifrado en tránsito (TLS 1.3) y en reposo para todos los datos almacenados.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:lock" className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                  <span>Control de acceso basado en roles (RBAC) con segregación de permisos entre Estudiante, Consejero y Admin_TI.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:lock" className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                  <span>Enmascaramiento automático de datos sensibles de categoría &quot;bienestar&quot; para perfiles técnicos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:lock" className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                  <span>Registro de auditoría (audit trail) de todas las acciones realizadas sobre los datos.</span>
                </li>
              </ul>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">8. Retención de Datos</h2>
              <p>
                Los datos personales asociados a solicitudes serán conservados durante el periodo académico vigente más un semestre adicional 
                para efectos de trazabilidad y generación de reportes institucionales. Transcurrido este plazo, los datos serán anonimizados 
                y solo se conservarán métricas agregadas sin identificación personal.
              </p>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">9. Cookies y Almacenamiento Local</h2>
              <p>
                La plataforma utiliza almacenamiento local del navegador (localStorage) exclusivamente para guardar borradores de formularios 
                en progreso y preferencias de interfaz. No utilizamos cookies de seguimiento ni compartimos información con plataformas de 
                publicidad. La funcionalidad offline de la PWA utiliza un Service Worker para almacenar en caché los recursos estáticos de 
                la aplicación.
              </p>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">10. Contacto</h2>
              <p>
                Para consultas relacionadas con esta política o el ejercicio de sus derechos, puede comunicarse con el Consejo de Sede 
                a través de los canales oficiales publicados en la Landing Page de la plataforma o directamente en las oficinas de 
                Dirección de Asuntos Estudiantiles de Duoc UC Sede Viña del Mar.
              </p>
            </section>

          </div>
        </article>

        <div className="mt-10">
          <Footer />
        </div>
      </main>
    </div>
  );
}
