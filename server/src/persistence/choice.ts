/**
 * Decisión de persistencia para el MVP de gestión hotelera (tarea 4 del flujo).
 *
 * Motor elegido: **SQLite** por defecto vía `DATABASE_URL` con prefijo `file:`.
 *
 * Justificación (MVP):
 * - **Despliegue**: un único fichero o volumen; sin servicio de BD aparte en local/demo.
 * - **Migraciones**: mismo flujo que con Postgres (SQL versionado); cambiar solo la URL y el driver.
 * - **Concurrencia**: escrituras serializadas en un solo proceso Node; para solapes de reservas el
 *   diseño previsto es transacción + bloqueo/verificación atómica (`BEGIN IMMEDIATE` o equivalente)
 *   en la misma conexión; límites de SQLite (un writer) son aceptables para MVP y demos.
 *
 * **Postgres** queda como evolución natural: `DATABASE_URL` con esquema `postgres:` o `postgresql:`,
 * mejor concurrencia de escritores y despliegue en contenedor/PaaS sin ficheros compartidos.
 */
export const PERSISTENCE_ENGINE_DEFAULT = "sqlite" as const;

export type PersistenceEngine = "sqlite" | "postgres";

export interface PersistenceMeta {
  engine: PersistenceEngine;
  rationale: string[];
  concurrencyMvp: string;
  migrationPathToPostgres: string;
  env: {
    databaseUrlVar: string;
    description: string;
  };
}

export function getPersistenceMeta(engine: PersistenceEngine): PersistenceMeta {
  const shared = [
    "Las reglas de negocio (solapes, estados) deben vivir en dominio; la BD aplica restricciones e índices.",
    "Postgres recomendado cuando haya múltiples instancias del API o alta contención de escritura.",
  ];

  if (engine === "sqlite") {
    return {
      engine: "sqlite",
      rationale: [
        "SQLite por defecto: cero infraestructura extra en desarrollo y demos reproducibles.",
        ...shared,
      ],
      concurrencyMvp:
        "Un proceso Node + SQLite: usar transacciones con bloqueo inmediato en rutas de reserva para evitar condiciones de carrera entre requests concurrentes al mismo fichero.",
      migrationPathToPostgres:
        "Mantener SQL portable donde sea posible; sustituir driver y `DATABASE_URL`; validar tipos (UUID, timestamps) e índices en entorno Postgres antes de producción.",
      env: {
        databaseUrlVar: "DATABASE_URL",
        description: 'Ejemplo local: file:./data/hotel.db (crear directorio `server/data/` si no existe).',
      },
    };
  }

  return {
    engine: "postgres",
    rationale: [
      "Motor actual según DATABASE_URL: Postgres para mejor paralelismo de escrituras y despliegue multi-instancia.",
      ...shared,
    ],
    concurrencyMvp:
      "Usar transacciones READ COMMITTED o SERIALIZABLE según caso; bloqueos a nivel fila en reservas/habitaciones para solapes.",
    migrationPathToPostgres:
      "Ya en Postgres: revisar pools (pg), timeouts y migraciones incrementales en CI.",
    env: {
      databaseUrlVar: "DATABASE_URL",
      description: "URL estándar postgresql://user:pass@host:5432/dbname",
    },
  };
}
