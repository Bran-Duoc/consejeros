# Diccionario de Términos del Sistema (Consejeros de Carrera)

Este documento centraliza el vocabulario y las descripciones oficiales de los procesos, estados y componentes dentro de la plataforma. **Es importante utilizar siempre estas mismas palabras** en el código, en la interfaz de usuario (UI) y en la comunicación interna para mantener consistencia y evitar confusiones.

## 1. Entidades Principales

- **Ticket (Solicitud / Caso)**: Registro formal de un requerimiento, problema o consulta creado por un estudiante u otro usuario del sistema. Es la unidad principal de trabajo.
- **Usuario (User)**: Persona que interactúa con el sistema. Puede tener diferentes roles (Estudiante, Supervisor, Consejo, Administrador TI).
- **Bitácora Interna**: Registro de comentarios y eventos del sistema dentro de un ticket, visible únicamente para el personal administrativo.
- **Auditoría (Audit Log)**: Registro inmutable de todas las acciones importantes (cambios de estado, transferencias) realizadas en la plataforma por cualquier usuario.

## 2. Estados del Ticket y Proceso Interno

*Nota: El flujo de proceso interno en la vista detallada de administración utiliza **exactamente los mismos estados** que el ciclo de vida global del ticket.*

- **Nuevo**: El ticket acaba de ser ingresado al sistema. No ha sido asignado a ningún agente ni ha comenzado su atención.
- **Pendiente**: El ticket ha sido asignado y está en la fase de "Recepción" o a la espera de una primera acción por parte del agente responsable.
- **En revisión**: El caso está siendo analizado activamente. Puede implicar recolección de antecedentes, revisión por otra unidad, o espera de información adicional.
- **Escalado**: La complejidad o naturaleza del ticket superó el nivel de soporte actual y requiere intervención de un área especializada superior o de un Supervisor.
- **Resuelto**: El problema o consulta del estudiante ha sido solucionado satisfactoriamente y el caso se considera cerrado operativamente.

## 3. Clasificación de Tickets

- **Categoría**: Área temática a la que pertenece el requerimiento. Las categorías oficiales son:
  - *Académico*
  - *Infraestructura*
  - *Bienestar*
  - *Financiero*
  - *Otro*
- **Urgencia**: Nivel de prioridad asignado al caso que define cuán rápido debe ser atendido. Niveles oficiales:
  - *Bajo*
  - *Medio*
  - *Alto*
  - *Crítico*

## 4. Métricas y Acuerdos

- **SLA (Service Level Agreement - Acuerdo de Nivel de Servicio)**: Tiempo máximo estipulado o fecha límite para resolver un ticket, calculado dinámicamente según su categoría y urgencia.
- **CSAT (Customer Satisfaction Score)**: Métrica que mide el nivel de satisfacción del usuario (de 1 a 5 estrellas) respecto a cómo fue resuelto su ticket.
- **CES (Customer Effort Score)**: Métrica que evalúa cuánto esfuerzo tuvo que realizar el estudiante para que se resolviera su problema.

## 5. Vistas y Componentes UI

- **Dashboard**: Panel de control principal que muestra estadísticas, KPIs y resúmenes operativos en tiempo real.
- **Lista de Tickets (Data Grid)**: Vista de tabla de alta densidad que permite ordenar, buscar, filtrar y cambiar de estado múltiples tickets de forma rápida (productividad masiva).
- **Cmd+K (Paleta de Comandos)**: Herramienta de búsqueda global rápida accesible mediante teclado para encontrar tickets o navegar rápidamente.

## 6. Roles del Sistema

- **Estudiante**: Usuario final que crea solicitudes y visualiza el historial de sus casos en su portal.
- **Supervisor**: Perfil con permisos de visualización general, gestión de casos de mayor nivel y monitoreo del equipo.
- **Administrador TI**: Encargado del soporte técnico, configuración del sistema (como SLAs) y administración general.
- **Consejo (Consejero de Carrera)**: Agente operativo primario que recibe, revisa y resuelve las consultas directas de los estudiantes.
