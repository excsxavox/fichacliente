import { useCallback } from "react";
import { fetchJson } from "../api/client";
import type { HealthResponse, MvpScopeResponse, StackMetaResponse } from "../api/types";
import { fetchMvpScope } from "../infrastructure/api/mvpScope";
import { useAsyncResource } from "../hooks/useAsyncResource";
import "./ApiStatusPanel.css";

type BootstrapData = {
  health: HealthResponse;
  stack: StackMetaResponse;
  mvpScope: MvpScopeResponse;
};

function loadBootstrap(): Promise<BootstrapData> {
  return Promise.all([
    fetchJson<HealthResponse>("/health"),
    fetchJson<StackMetaResponse>("/v1/meta/stack"),
    fetchMvpScope(),
  ]).then(([health, stack, mvpScope]) => ({ health, stack, mvpScope }));
}

export function ApiStatusPanel() {
  const bootstrapLoad = useCallback(() => loadBootstrap(), []);
  const boot = useAsyncResource(bootstrapLoad);

  const loading = boot.status === "loading";
  const error = boot.status === "error";

  return (
    <section className="panel" aria-busy={loading}>
      <div className="panel__toolbar">
        <p className="panel__intro" id="panel-desc">
          Comprueba la conectividad con el BFF, el alcance formal del MVP de reservas
          (desde <code>/v1/meta/mvp-scope</code>) y las notas de política en metadatos
          de stack.
        </p>
        <button
          type="button"
          className="panel__reload"
          onClick={() => boot.reload()}
          disabled={loading}
          aria-describedby="panel-desc"
        >
          {loading ? "Actualizando…" : "Volver a cargar"}
        </button>
      </div>

      {loading && (
        <p className="panel__state" role="status">
          Cargando estado del servicio y documento de alcance…
        </p>
      )}

      {error && !loading && (
        <div className="panel__alert" role="alert">
          <strong>No se pudo completar la consulta.</strong>
          <p className="panel__errors panel__errors--single">{boot.message}</p>
          <p className="panel__hint">
            Asegúrate de que el BFF esté en ejecución (por defecto puerto 3000) o
            define <code>VITE_API_BASE_URL</code> apuntando a su URL pública.
          </p>
        </div>
      )}

      {!loading && boot.status === "success" && (
        <>
          <article className="card" aria-labelledby="health-heading">
            <h3 id="health-heading" className="card__title">
              Salud del servicio
            </h3>
            <dl className="card__dl">
              <div>
                <dt>Estado</dt>
                <dd>{boot.data.health.status}</dd>
              </div>
              <div>
                <dt>Servicio</dt>
                <dd>{boot.data.health.service}</dd>
              </div>
              <div>
                <dt>Ambiente</dt>
                <dd>{boot.data.health.environment}</dd>
              </div>
            </dl>
          </article>

          <article className="card" aria-labelledby="mvp-heading">
            <h3 id="mvp-heading" className="card__title">
              Alcance MVP — reservas hoteleras
            </h3>
            <p className="card__lead">
              Contrato <code>{boot.data.mvpScope.contractVersion}</code> ·
              actualizado {boot.data.mvpScope.lastUpdated}
            </p>
            <h4 className="card__sub">Fuera de alcance (explícito)</h4>
            <ul className="card__list">
              {boot.data.mvpScope.explicitNonGoals.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h4 className="card__sub">Disponibilidad ({boot.data.mvpScope.availability.mode})</h4>
            <p className="card__para">{boot.data.mvpScope.availability.summary}</p>
            <ul className="card__list">
              {boot.data.mvpScope.availability.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <h4 className="card__sub">Solicitud de reserva — campos</h4>
            <p className="card__para">{boot.data.mvpScope.reservationRequest.summary}</p>
            <p className="card__field-group-title">Huésped (obligatorios)</p>
            <ul className="card__field-list" aria-label="Campos obligatorios del huésped">
              {boot.data.mvpScope.reservationRequest.requiredGuestFields.map((f) => (
                <li key={f.id}>
                  <span className="card__field-id">{f.id}</span>
                  <span className="card__field-label">{f.label}</span>
                  <span className="card__field-format">{f.format}</span>
                </li>
              ))}
            </ul>
            <p className="card__field-group-title">Estancia (obligatorios)</p>
            <ul className="card__field-list" aria-label="Campos obligatorios de la estancia">
              {boot.data.mvpScope.reservationRequest.requiredStayContextFields.map((f) => (
                <li key={f.id}>
                  <span className="card__field-id">{f.id}</span>
                  <span className="card__field-label">{f.label}</span>
                  <span className="card__field-format">{f.format}</span>
                </li>
              ))}
            </ul>
            <p className="card__field-group-title">Opcionales</p>
            <ul className="card__field-list" aria-label="Campos opcionales">
              {boot.data.mvpScope.reservationRequest.optionalFields.map((f) => (
                <li key={f.id}>
                  <span className="card__field-id">{f.id}</span>
                  <span className="card__field-label">{f.label}</span>
                  <span className="card__field-format">{f.format}</span>
                </li>
              ))}
            </ul>
            <h4 className="card__sub">Flujo operativo de leads</h4>
            <p className="card__para">{boot.data.mvpScope.operationalFlow.summary}</p>
            <ul className="card__list">
              {boot.data.mvpScope.operationalFlow.leadHandling.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card" aria-labelledby="meta-heading">
            <h3 id="meta-heading" className="card__title">
              Stack y políticas (API)
            </h3>
            <dl className="card__dl">
              <div>
                <dt>Repositorio</dt>
                <dd>{boot.data.stack.repository}</dd>
              </div>
              <div>
                <dt>Runtime</dt>
                <dd>{boot.data.stack.runtime}</dd>
              </div>
              <div>
                <dt>Lenguaje</dt>
                <dd>{boot.data.stack.language}</dd>
              </div>
              <div>
                <dt>Framework API</dt>
                <dd>{boot.data.stack.framework}</dd>
              </div>
              <div>
                <dt>Prefijo API</dt>
                <dd>
                  <code>{boot.data.stack.apiPrefix}</code>
                </dd>
              </div>
            </dl>
            <h4 className="card__sub">Notas</h4>
            <ul className="card__list">
              {boot.data.stack.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>

          <p className="panel__empty-note" role="note">
            Las pantallas de búsqueda, ficha y formulario de solicitud se integrarán
            en iteraciones posteriores; aquí se muestra el documento de alcance que
            gobierna ese flujo.
          </p>
        </>
      )}
    </section>
  );
}
