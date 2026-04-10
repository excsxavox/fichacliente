import { useCallback, useMemo } from "react";
import { fetchJson } from "../api/client";
import type { HealthResponse, StackMetaResponse } from "../api/types";
import { useAsyncResource } from "../hooks/useAsyncResource";
import "./ApiStatusPanel.css";

function loadHealth() {
  return fetchJson<HealthResponse>("/health");
}

function loadStackMeta() {
  return fetchJson<StackMetaResponse>("/v1/meta/stack");
}

export function ApiStatusPanel() {
  const healthLoad = useCallback(() => loadHealth(), []);
  const metaLoad = useCallback(() => loadStackMeta(), []);

  const health = useAsyncResource(healthLoad);
  const meta = useAsyncResource(metaLoad);

  const bothLoading = health.status === "loading" || meta.status === "loading";
  const anyError = health.status === "error" || meta.status === "error";

  const errorMessages = useMemo(() => {
    const out: string[] = [];
    if (health.status === "error") out.push(`Health: ${health.message}`);
    if (meta.status === "error") out.push(`Stack: ${meta.message}`);
    return out;
  }, [health, meta]);

  return (
    <section className="panel" aria-busy={bothLoading}>
      <div className="panel__toolbar">
        <p className="panel__intro" id="panel-desc">
          Comprueba la conectividad con el BFF y revisa las notas de política de
          seguridad expuestas en metadatos.
        </p>
        <button
          type="button"
          className="panel__reload"
          onClick={() => {
            health.reload();
            meta.reload();
          }}
          disabled={bothLoading}
          aria-describedby="panel-desc"
        >
          {bothLoading ? "Actualizando…" : "Volver a cargar"}
        </button>
      </div>

      {bothLoading && (
        <p className="panel__state" role="status">
          Cargando estado del servicio…
        </p>
      )}

      {anyError && !bothLoading && (
        <div className="panel__alert" role="alert">
          <strong>No se pudo completar la consulta.</strong>
          <ul className="panel__errors">
            {errorMessages.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="panel__hint">
            Asegúrate de que el BFF esté en ejecución (por defecto puerto 3000) o
            define <code>VITE_API_BASE_URL</code> apuntando a su URL pública.
          </p>
        </div>
      )}

      {!bothLoading && health.status === "success" && (
        <article className="card" aria-labelledby="health-heading">
          <h3 id="health-heading" className="card__title">
            Salud del servicio
          </h3>
          <dl className="card__dl">
            <div>
              <dt>Estado</dt>
              <dd>{health.data.status}</dd>
            </div>
            <div>
              <dt>Servicio</dt>
              <dd>{health.data.service}</dd>
            </div>
            <div>
              <dt>Ambiente</dt>
              <dd>{health.data.environment}</dd>
            </div>
          </dl>
        </article>
      )}

      {!bothLoading && meta.status === "success" && (
        <article className="card" aria-labelledby="meta-heading">
          <h3 id="meta-heading" className="card__title">
            Stack y políticas (API)
          </h3>
          <dl className="card__dl">
            <div>
              <dt>Repositorio</dt>
              <dd>{meta.data.repository}</dd>
            </div>
            <div>
              <dt>Runtime</dt>
              <dd>{meta.data.runtime}</dd>
            </div>
            <div>
              <dt>Lenguaje</dt>
              <dd>{meta.data.language}</dd>
            </div>
            <div>
              <dt>Framework API</dt>
              <dd>{meta.data.framework}</dd>
            </div>
            <div>
              <dt>Prefijo API</dt>
              <dd>
                <code>{meta.data.apiPrefix}</code>
              </dd>
            </div>
            {meta.data.mvpReservationDecision && (
              <div className="card__decision">
                <dt>Decisión MVP reservas</dt>
                <dd>
                  <p className="card__decision-badge">
                    <span className="visually-hidden">Opción elegida: </span>
                    <span
                      className="card__choice"
                      aria-label={`Opción ${meta.data.mvpReservationDecision.choice}`}
                    >
                      {meta.data.mvpReservationDecision.choice}
                    </span>
                  </p>
                  <p className="card__decision-text">
                    {meta.data.mvpReservationDecision.label}
                  </p>
                  <p className="card__decision-acta">
                    Acta en repositorio:{" "}
                    <code>{meta.data.mvpReservationDecision.actaRelativePath}</code>
                  </p>
                </dd>
              </div>
            )}
          </dl>
          <h4 className="card__sub">Notas de seguridad / PII</h4>
          <ul className="card__list">
            {meta.data.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </article>
      )}

      {!bothLoading &&
        health.status === "success" &&
        meta.status === "success" && (
          <p className="panel__empty-note" role="note">
            No hay más datos en esta pantalla de arranque; las secciones de ficha
            (información, productos, call center) se integrarán en iteraciones
            posteriores.
          </p>
        )}
    </section>
  );
}
