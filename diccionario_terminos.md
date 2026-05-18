# Diccionario de Términos del Sistema (Consejeros de Carrera)

Este documento centraliza el vocabulario, las descripciones oficiales y la taxonomía de los procesos, estados, categorías y componentes dentro de la plataforma **Consejeros de Carrera**. Su objetivo es mantener la consistencia terminológica en el código fuente, la interfaz de usuario (UI) y las comunicaciones institucionales.

---

## 1. Filosofía de Servicio: "Orientación y Derivación"

El sistema ha sido transformado para actuar como un **Hub de Orientación y Derivación**. El Consejero de Carrera **no reemplaza** a los especialistas de cada área (como psicólogos, ejecutivos de financiamiento o coordinadores docentes), sino que actúa como un **guía y facilitador** para que el estudiante acceda de forma ágil y segura a los canales oficiales institucionales de Duoc UC.

---

## 2. Entidades Principales

*   **Ticket (Caso / Solicitud)**: Registro formal de una consulta, reporte o duda de orientación creado por un estudiante. Es la unidad central de trabajo del Consejero.
*   **Usuario (User)**: Cualquier persona que interactúa con la plataforma. Posee un rol específico que define sus vistas y permisos.
*   **Bitácora Interna**: Espacio de comentarios privados en la vista detallada del ticket. Es de uso exclusivo para el personal administrativo (Consejeros y Supervisores) para registrar notas de seguimiento, estados de derivación o bitácora de llamadas.
*   **Auditoría (Audit Log)**: Registro inmutable de eventos críticos asociados al ticket (creación, asignación, cambios de estado, reclasificación o derivación), resguardando la trazabilidad y transparencia.

---

## 3. Estados de Ticket (Ciclo de Vida Global)

El flujo operativo y visual en la administración de casos sigue exactamente el mismo ciclo de vida:

1.  **Nuevo**: El ticket ha sido creado por el estudiante y está a la espera de ser asignado a un Consejero de Carrera.
2.  **Pendiente**: El caso ha sido asignado a un Consejero y está en etapa de recepción o a la espera de una primera acción de contacto/revisión.
3.  **En revisión**: El Consejero está gestionando activamente el caso (buscando información en el directorio de sede, recopilando antecedentes o coordinando derivaciones).
4.  **Escalado**: El caso excede el ámbito de la consejería y requiere la intervención directa de un Supervisor o una jefatura de área específica.
5.  **Resuelto**: La orientación o derivación ha sido entregada con éxito al estudiante y el ticket se considera cerrado operativamente.

---

## 4. Taxonomía y Categorías Oficiales

La plataforma organiza las solicitudes bajo **5 grandes categorías**. Cada una de ellas define claramente las subcategorías y opciones de selección que el estudiante visualiza en el formulario y que el personal administrativo gestiona en el panel Kanban y Data Grid.

### I. Académico (`academico`)
Enfocado en apoyar el éxito curricular y la inserción académica de los estudiantes.
*   **Docentes**:
    *   *Metodología y Aprendizaje*: Apoyo para mejorar la comprensión y el enfoque de las clases.
    *   *Convivencia y Trato*: Fomentar un ambiente positivo de respeto mutuo.
    *   *Asistencia y Puntualidad*: Coordinación y seguimiento de los horarios académicos.
    *   *Evaluaciones y Rúbricas*: Claridad en pautas y revisión constructiva de calificaciones.
*   **Gestión Académica**:
    *   *Toma de Ramos y Topes*: Asesoría para optimizar y organizar el horario semestral.
    *   *Mallas y Prerrequisitos*: Orientación vocacional y guía sobre asignaturas.
    *   *Ayudantías y Reforzamientos*: Oportunidades de apoyo continuo y aprendizaje.
    *   *Certificados y Convalidaciones*: Acompañamiento en trámites formales académicos.
*   **Plataformas y Sistemas**:
    *   *Aula Virtual (AVA)*: Asistencia para potenciar la experiencia de aprendizaje en línea.
    *   *Portafolio y Maletín*: Soporte en herramientas institucionales y portafolio.
    *   *Correo e Identidad*: Asistencia de acceso a cuentas institucionales.

### II. Experiencia y Campus (`infraestructura`)
*Antes: "Infraestructura"*. Reenfocado a recolectar sugerencias y reportes que optimicen la habitabilidad y el ambiente del campus.
*   **Espacios Comunes**:
    *   *Casino y Alimentación*: Reporte de sugerencias para mejorar los espacios de comida.
    *   *Patios y Áreas de Descanso*: Iniciativas para enriquecer las zonas de esparcimiento.
    *   *Baños e Instalaciones*: Reportes sobre confort y limpieza de infraestructura.
*   **Entorno de Aprendizaje**:
    *   *Biblioteca y Salas de Estudio*: Dudas sobre reservas o aprovechamiento de espacios de silencio.
    *   *Laboratorios y Talleres*: Reporte o sugerencias sobre equipamiento e infraestructura técnica.
    *   *Salas de Clases*: Iniciativas sobre el confort, pizarras y equipamiento del aula.
*   **Servicios Generales**:
    *   *WiFi y Conectividad*: Reporte centralizado para optimizar nuestra red institucional.
    *   *Seguridad y Accesos*: Reportes o consultas para mantener un entorno seguro.

### III. Punto Estudiantil (Apoyo) (`bienestar`)
*Antes: "Bienestar"*. Categoría altamente sensible orientada a la canalización rápida y oportuna hacia especialistas del campus.
*   **Salud y Apoyo Psicológico**:
    *   *Orientación Psicológica (PAE)*: Guía paso a paso sobre cómo y dónde agendar con los especialistas psicólogos de Punto Estudiantil.
    *   *Primeros Auxilios*: Indicación exacta de cómo proceder y a quién acudir ante emergencias de salud dentro del campus.
*   **Vida Universitaria**:
    *   *Talleres y Deportes (DAE)*: Información y guía sobre cómo inscribirse en actividades extraprogramáticas.
    *   *Pastoral y Misiones*: Conectividad y derivación con los coordinadores del área espiritual.
*   **Comunidad e Integración**:
    *   *Inclusión y Diversidad*: Orientación sobre protocolos institucionales y apoyos equitativos.
    *   *Voluntariados y Servicios*: Derivación para conocer becas de trabajo y ayudas comunitarias.

### IV. Orientación Financiera (`financiero`)
*Antes: "Financiero"*. Brinda una guía de orientación física y digital sobre financiamiento, evitando el manejo directo de cuentas por parte del Consejero.
*   **Becas y Beneficios**:
    *   *Guía de Becas Estatales*: Orientación sobre los canales de consulta y plazos de Gratuidad o CAE.
    *   *Guía de Becas Internas*: Información oficial y puntos de contacto para comunicarse con los ejecutivos de financiamiento de Duoc UC.
*   **Consultas de Pago**:
    *   *Derivación Aranceles y Matrículas*: Indicación de los canales de pago institucionales y autoatención.
    *   *Derivación Casos Especiales*: Guía informativa sobre oficinas y ejecutivos correspondientes para repactaciones.
*   **Renovación y Suspensión**:
    *   *Suspensión de Beneficios*: Orientación básica sobre los pasos académicos y financieros para congelar una becas o suspensión de carrera.

### V. Guía Práctica: ¿Cómo y Dónde? (`otro`)
*Antes: "Otro"*. Transformado en una herramienta interactiva rápida y útil llamada **Directorio de Sede**, sirviendo como guía espacial y funcional en el campus.
*   **Directorio de Sede**:
    *   *¿Dónde queda este lugar?*: Ayuda espacial para geolocalizar salas, laboratorios, oficinas administrativas o servicios comunes de la Sede Viña del Mar.
    *   *¿Con quién debo hablar?*: Orientación directa e indicación del departamento o persona encargada de resolver una necesidad específica.
*   **Soporte Digital Rápido**:
    *   *Ayuda App Experiencia Duoc*: Tutoría y resolución de dudas rápidas sobre el uso de la aplicación móvil institucional.
    *   *Credencial Virtual*: Guía paso a paso para la correcta activación y uso de la credencial digital en dispositivos móviles.

---

## 5. Resguardo Ético y Límites de la Asistencia

Para resguardar la seguridad del estudiante y la responsabilidad legal de la institución, los Consejeros de Carrera aplican límites de atención estrictos:

1.  **Límite en Salud Mental**: El Consejero **jamás** realiza contención psicológica clínica o diagnóstico de patologías. Su función única es identificar la necesidad y guiar de inmediato al estudiante a agendar cita en el **PAE (Programa de Apoyo al Estudiante)** de Punto Estudiantil o canalizar la urgencia con primeros auxilios.
2.  **Límite en Operaciones Financieras**: El Consejero no aprueba repactaciones, no condona deudas ni aplica descuentos directamente en el sistema. Proporciona los correos, ubicaciones físicas y horarios de los ejecutivos oficiales de Financiamiento.
3.  **Límite en Cambios Curriculares**: El Consejero orienta sobre mallas y prerrequisitos de la Escuela de Informática, Diseño, Comunicación, etc. Sin embargo, la inscripción final de ramos o suspensiones formales de carrera deben canalizarse mediante el Portal del Alumno oficial o con el respectivo Coordinador Docente.

> [!IMPORTANT]
> **Advertencias Visuales (UI Warnings):** La interfaz del formulario para estudiantes incorpora advertencias no intrusivas en las áreas de salud mental y financiera, educando de antemano sobre los alcances del Consejero de Carrera, asegurando una derivación transparente y mitigando falsas expectativas.

---

## 6. Métricas de Gestión y Desempeño

*   **SLA (Service Level Agreement)**: Plazo máximo de resolución del ticket. Se calcula de forma automática y dinámica según la Categoría y el nivel de Urgencia (Bajo, Medio, Alto, Crítico) definidos al crear o revaluar el caso.
*   **CSAT (Customer Satisfaction Score)**: Escala del 1 al 5 (representado con estrellas) que el estudiante asigna una vez resuelto el ticket. Evalúa la calidad de la orientación brindada por el Consejero.
*   **CES (Customer Effort Score)**: Escala de 1 a 7 que indica la facilidad con la que el estudiante pudo gestionar su consulta. Permite identificar fricción en los procesos de derivación de la sede.

---

## 7. Roles y Niveles de Acceso en el Sistema

*   **Estudiante**: Usuario final que interactúa con el formulario dinámico compacto (estilo móvil/PWA), busca información básica de sede y consulta el estado de sus requerimientos.
*   **Consejero de Carrera (Consejo)**: Agente de primera línea. Administra la mesa de ayuda, realiza entrevistas breves, usa el Directorio de Sede para orientar al alumno, añade bitácoras internas y deriva o resuelve el ticket.
*   **Supervisor**: Encargado del equipo de Consejeros de la sede. Posee visualización analítica completa en tiempo real, capacidad de reasignar tickets críticamente demorados, y realizar auditorías a los registros.
*   **Administrador TI**: Soporte técnico avanzado. Administra los parámetros técnicos globales de la plataforma, configura SLAs (tiempos límites y alertas de cumplimiento) y resguarda la base de datos de auditoría.
