"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import Footer from "@/components/Footer";

export default function ServicioPage() {
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Icon icon="lucide:scroll-text" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Condiciones del Servicio</h1>
                <p className="text-xs sm:text-sm text-foreground/50 font-medium">Última actualización: 27 de abril de 2026</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-foreground/80">
            
            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">1. Objeto del Servicio</h2>
              <p>
                Las presentes Condiciones del Servicio regulan el acceso y uso del <strong>Portal Hub del Consejo de Sede</strong>, 
                una Aplicación Web Progresiva (PWA) desarrollada como puente digital oficial entre el alumnado y el Consejo de Sede 
                de Duoc UC — Sede Viña del Mar. La plataforma permite a los estudiantes enviar solicitudes, realizar seguimiento 
                de sus requerimientos y participar activamente en la mejora de la experiencia estudiantil.
              </p>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">2. Aceptación de las Condiciones</h2>
              <p>
                Al acceder a la plataforma mediante su cuenta institucional de Google Workspace (@duocuc.cl), usted declara haber leído, 
                comprendido y aceptado íntegramente estas condiciones. El uso continuado de los servicios constituye su consentimiento 
                expreso. Si usted no está de acuerdo con alguna de estas condiciones, debe abstenerse de utilizar la plataforma.
              </p>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">3. Usuarios y Roles</h2>
              <p className="mb-3">La plataforma opera bajo un sistema de Control de Acceso Basado en Roles (RBAC) con tres niveles:</p>
              <div className="space-y-3">
                {[
                  { 
                    role: "Estudiante", 
                    icon: "lucide:user", 
                    color: "bg-blue-50 text-blue-700 border-blue-200",
                    desc: "Puede enviar solicitudes a través del formulario dinámico multipaso, consultar el estado de sus requerimientos en su Portal Personal (/perfil), completar encuestas de satisfacción post-resolución y acceder a las métricas públicas de transparencia." 
                  },
                  { 
                    role: "Consejero de Carrera", 
                    icon: "lucide:graduation-cap", 
                    color: "bg-purple-50 text-purple-700 border-purple-200",
                    desc: "Accede al Panel de Administración (/admin) con el Tablero Kanban privado para gestionar, asignar y resolver solicitudes. Puede visualizar datos de todas las categorías, incluidas las de bienestar estudiantil, para una atención integral." 
                  },
                  { 
                    role: "Admin TI", 
                    icon: "lucide:settings", 
                    color: "bg-slate-100 text-slate-700 border-slate-200",
                    desc: "Accede al Panel de Administración con capacidades técnicas de gestión. Los datos de la categoría \"bienestar\" son automáticamente enmascarados para este rol, en cumplimiento de la Ley 21.719 sobre protección de datos sensibles." 
                  },
                ].map((item) => (
                  <div key={item.role} className={`p-4 rounded-xl border ${item.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon icon={item.icon} className="w-5 h-5" />
                      <h4 className="font-bold">{item.role}</h4>
                    </div>
                    <p className="text-xs sm:text-sm opacity-80">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">4. Requisitos de Acceso</h2>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:check" className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                  <span>Ser estudiante matriculado, consejero electo o funcionario designado de Duoc UC Sede Viña del Mar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:check" className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                  <span>Poseer una cuenta de correo electrónico institucional activa (@duocuc.cl).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:check" className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                  <span>Contar con un dispositivo con navegador web moderno compatible con PWA (Chrome, Safari, Edge, Firefox).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:check" className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                  <span>Aceptar la Política de Privacidad vigente de la plataforma.</span>
                </li>
              </ul>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">5. Uso Aceptable de la Plataforma</h2>
              <p className="mb-3">El usuario se compromete a:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:circle-dot" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span>Utilizar la plataforma exclusivamente para los fines académicos, institucionales y de representación estudiantil descritos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:circle-dot" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span>Proporcionar información veraz, precisa y completa en todas las solicitudes enviadas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:circle-dot" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span>No enviar solicitudes fraudulentas, difamatorias, ofensivas o que vulneren los derechos de terceros.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:circle-dot" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span>No intentar acceder a datos, funcionalidades o áreas administrativas para las cuales no posea autorización.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:circle-dot" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span>No realizar ingeniería inversa, modificar ni explotar vulnerabilidades de la plataforma.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:circle-dot" className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span>Respetar las normas de convivencia institucional de Duoc UC en todas las comunicaciones realizadas a través del sistema.</span>
                </li>
              </ul>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">6. Proceso de Solicitudes</h2>
              <p className="mb-3">
                Las solicitudes enviadas a través del formulario dinámico multipaso siguen el siguiente flujo de gestión:
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-wrap">
                {["Nuevo", "Pendiente", "En Revisión", "Escalado", "Resuelto"].map((status, i) => (
                  <React.Fragment key={status}>
                    <div className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold">
                      {status}
                    </div>
                    {i < 4 && <Icon icon="lucide:arrow-right" className="w-4 h-4 text-foreground/30 hidden sm:block" />}
                    {i < 4 && <Icon icon="lucide:arrow-down" className="w-4 h-4 text-foreground/30 sm:hidden ml-4" />}
                  </React.Fragment>
                ))}
              </div>
              <p className="mt-4">
                Cada solicitud es gestionada conforme a los Acuerdos de Nivel de Servicio (SLA) internos, con tiempos de respuesta 
                que varían según la categoría y el nivel de urgencia declarado. El sistema monitorea automáticamente los plazos 
                y genera alertas al 50%, 75% y 90% de consumo del SLA.
              </p>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">7. Disponibilidad del Servicio</h2>
              <p>
                La plataforma está diseñada como una PWA con arquitectura &quot;Offline-First&quot;, lo que permite a los usuarios 
                completar formularios y consultar información incluso sin conexión a internet. Los datos capturados offline se 
                sincronizarán automáticamente cuando se restablezca la conectividad. No obstante, el Consejo no garantiza una 
                disponibilidad ininterrumpida del 100% y se reserva el derecho de realizar mantenimientos programados que serán 
                comunicados con antelación razonable.
              </p>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">8. Propiedad Intelectual</h2>
              <p>
                El diseño, código fuente, logotipos, elementos gráficos, la identidad visual (franjas institucionales, paleta de colores) 
                y el contenido original de la plataforma son propiedad del Consejo de Sede y de Duoc UC. Se prohíbe su reproducción, 
                distribución o modificación sin autorización previa por escrito. Los contenidos generados por los usuarios 
                (solicitudes, comentarios de encuestas) permanecen como propiedad intelectual de sus autores.
              </p>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">9. Limitación de Responsabilidad</h2>
              <p>
                El Consejo de Sede realiza sus mejores esfuerzos para resolver las solicitudes recibidas dentro de los plazos 
                SLA establecidos. Sin embargo, la plataforma actúa como un canal de comunicación y gestión, no como un órgano 
                resolutivo con potestad administrativa. Las decisiones institucionales derivadas de las solicitudes son responsabilidad 
                de las unidades académicas y administrativas correspondientes de Duoc UC. El Consejo no se responsabiliza por:
              </p>
              <ul className="mt-3 space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:alert-circle" className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                  <span>Resoluciones que dependan de terceros o de la administración central de Duoc UC.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:alert-circle" className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                  <span>Información incorrecta o incompleta proporcionada por el usuario en sus solicitudes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:alert-circle" className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                  <span>Interrupciones del servicio causadas por factores externos (conectividad, infraestructura de terceros).</span>
                </li>
              </ul>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">10. Suspensión y Terminación</h2>
              <p>
                El Consejo se reserva el derecho de suspender o restringir el acceso de un usuario que incumpla estas condiciones, 
                que utilice la plataforma de forma abusiva o que comprometa la seguridad del sistema. La suspensión será comunicada 
                al correo institucional del usuario afectado, con una descripción clara de los motivos. El usuario podrá apelar 
                dicha decisión ante la Dirección de Asuntos Estudiantiles.
              </p>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">11. Modificaciones</h2>
              <p>
                Estas condiciones podrán ser actualizadas periódicamente para reflejar cambios normativos, funcionales o 
                institucionales. Las modificaciones sustanciales serán comunicadas a través de la propia plataforma y mediante 
                los canales oficiales del Consejo. La fecha de última actualización siempre estará visible en el encabezado 
                de este documento.
              </p>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">12. Legislación Aplicable</h2>
              <p>
                Estas condiciones se rigen por la legislación vigente de la República de Chile, en particular por la 
                <strong> Ley N° 21.719 sobre Protección de Datos Personales</strong> y las normativas internas de Duoc UC. 
                Cualquier controversia será sometida a los tribunales ordinarios de justicia con jurisdicción en la ciudad de 
                Viña del Mar, Región de Valparaíso.
              </p>
            </section>

            <section className="bg-white/80 rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">13. Contacto</h2>
              <p>
                Para consultas, sugerencias o reclamos relacionados con estas condiciones, puede comunicarse con el Consejo de Sede 
                a través del formulario de solicitudes de la plataforma (categoría &quot;Otro&quot;) o presencialmente en las oficinas 
                de la Dirección de Asuntos Estudiantiles de Duoc UC Sede Viña del Mar.
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
