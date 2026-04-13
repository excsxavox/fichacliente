# Acta de decisión de producto y arquitectura — MVP reservas (cadena de hoteles)

**Fecha:** 2026-04-10  
**Repositorio:** monorepo actual (`frontend` + `server`, Node.js + TypeScript).  
**Alcance del acta:** elegir entre **A** evolucionar este repo al MVP de reservas, **B** entregar otro repositorio, o **C** convivencia de dominios con **namespacing** claro bajo `/v1`.

| Opción | Descripción breve |
|--------|-------------------|
| **A** | Este repositorio pivota hacia el MVP de reservas como foco principal de producto. |
| **B** | MVP de reservas en otro repositorio; este repo se centra solo en Ficha Cliente. |
| **C** | Mismo monorepo: Ficha Cliente y MVP de reservas conviven; API del MVP bajo **`/v1`** con módulos y rutas de UI separados. |

---

## Decisión adoptada: **C** (convivencia con namespacing bajo `/v1`)

Se **descarta B** (otro repositorio): el workflow global y el equipo acuerdan concentrar modelo de datos, API y cliente en **este** monorepo para iterar más rápido y mantener contratos alineados.

La opción **A** (“evolucionar este repo al MVP de reservas”) queda **subsumida** en **C**: el MVP de reservas se implementa **en este mismo repo**, sin obligar a retirar de golpe el contexto existente de **Ficha Cliente** (BFF, variables `AFFINITY_*`, rutas como `/v1/meta/stack`). En su lugar:

- Toda API REST JSON **nueva** del MVP de reservas se expone bajo el prefijo **`/v1`**, con rutas y módulos dedicados (p. ej. `server/src/http/routes/v1/` y `server/src/modules/reservations/`), contratos estables y versionado futuro coherente con ese prefijo.
- El dominio **Ficha Cliente** puede convivir en el mismo proceso y prefijo **`/v1`** mientras sus recursos estén **acotados por path** (p. ej. `/v1/meta/*`, rutas FC explícitas) y no se mezclen responsabilidades con hoteles/reservas en los mismos handlers sin criterio.
- El **front** mantendrá una capa `shared/api` hacia `/v1`; la UI de reservas no reutilizará pantallas de Ficha Cliente sin aislamiento (rutas/labels o namespaces de UI según DoD del flujo).

**Implicaciones:** un solo despliegue y un solo BFF/servidor Fastify; documentación de variables de entorno y CORS debe contemplar orígenes del front de reservas y, cuando aplique, segregación por módulo en código, no por repo.

---

## Responsables y revisión

- **Registrado por:** agente backend (workflow Cursor).  
- **Revisión recomendada:** producto / arquitectura antes de cerrar el MVP para confirmar que no se reabre la opción B ni se mezclan dominios en la misma pantalla sin criterio.

---

## Referencia en código

La decisión **C** y la ruta del acta se reflejan en la respuesta de `GET /v1/meta/stack` (campo `mvpReservationDecision`).
