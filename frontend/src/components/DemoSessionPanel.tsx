import { useCallback } from "react";
import { fetchJson } from "../api/client";
import type { HotelMvpDemoSessionResponse } from "../api/types";
import { useAsyncResource } from "../hooks/useAsyncResource";
import "./DemoSessionPanel.css";

function loadDemoSession() {
  return fetchJson<HotelMvpDemoSessionResponse>("/v1/demo/hotel-mvp-session");
}

function buildQueryString(query: Record<string, string> | undefined): string {
  if (!query || Object.keys(query).length === 0) return "";
  const p = new URLSearchParams(query);
  return `?${p.toString()}`;
}

export function DemoSessionPanel() {
  const load = useCallback(() => loadDemoSession(), []);
  const session = useAsyncResource(load);

  return (
    <section
      className="demo-panel"
      aria-labelledby="demo-session-heading"
      aria-busy={session.status === "loading"}
    >
      <div className="demo-panel__toolbar">
        <div>
          <h2 id="demo-session-heading" className="demo-panel__title">
            Demo hotel MVP (una sesión)
          </h2>
          <p className="demo-panel__intro" id="demo-session-desc">
            Guion reproducible: datos seed y secuencia de llamadas HTTP previstas
            bajo <code>/v1</code>. El servidor expone este contenido en{" "}
            <code>GET /v1/demo/hotel-mvp-session</code>.
          </p>
        </div>
        <button
          type="button"
          className="demo-panel__reload"
          onClick={() => session.reload()}
          disabled={session.status === "loading"}
          aria-describedby="demo-session-desc"
        >
          {session.status === "loading" ? "Cargando…" : "Recargar guion"}
        </button>
      </div>

      {session.status === "loading" && (
        <p className="demo-panel__state" role="status">
          Cargando guion de demo…
        </p>
      )}

      {session.status === "error" && (
        <div className="demo-panel__alert" role="alert">
          <strong>No se pudo cargar el guion de demo.</strong>
          <p className="demo-panel__err-msg">{session.message}</p>
          <p className="demo-panel__hint">
            Arranca el BFF (puerto 3000 con proxy de Vite) o define{" "}
            <code>VITE_API_BASE_URL</code>.
          </p>
        </div>
      )}

      {session.status === "success" && (
        <>
          <p className="demo-panel__meta" role="note">
            <span className="demo-panel__badge">{session.data.id}</span>
            <span aria-hidden="true"> · </span>
            Versión {session.data.version}, referencia {session.data.referenceDate},{" "}
            {session.data.locale}
          </p>

          <article className="demo-card" aria-labelledby="narrative-heading">
            <h3 id="narrative-heading" className="demo-card__title">
              Narrativa
            </h3>
            <p className="demo-card__text">{session.data.narrative}</p>
          </article>

          <article className="demo-card" aria-labelledby="assumptions-heading">
            <h3 id="assumptions-heading" className="demo-card__title">
              Supuestos
            </h3>
            <ul className="demo-card__list">
              {session.data.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </article>

          <article className="demo-card" aria-labelledby="glossary-heading">
            <h3 id="glossary-heading" className="demo-card__title">
              Glosario
            </h3>
            <dl className="demo-glossary">
              {Object.entries(session.data.glossary).map(([key, text]) => (
                <div key={key} className="demo-glossary__row">
                  <dt>{key}</dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="demo-card" aria-labelledby="actors-heading">
            <h3 id="actors-heading" className="demo-card__title">
              Actores seed (<code>x-actor-id</code>)
            </h3>
            <dl className="demo-card__dl">
              <div>
                <dt>Staff</dt>
                <dd>
                  <code>{session.data.seed.actorIds.staff}</code>
                </dd>
              </div>
              <div>
                <dt>Huésped Ana</dt>
                <dd>
                  <code>{session.data.seed.actorIds.guestAna}</code>
                </dd>
              </div>
              <div>
                <dt>Huésped Luis</dt>
                <dd>
                  <code>{session.data.seed.actorIds.guestLuis}</code>
                </dd>
              </div>
            </dl>
          </article>

          <article className="demo-card" aria-labelledby="domain-heading">
            <h3 id="domain-heading" className="demo-card__title">
              Propiedad, habitaciones y reservas seed
            </h3>
            <h4 className="demo-card__sub">Propiedad</h4>
            <dl className="demo-card__dl">
              <div>
                <dt>Nombre</dt>
                <dd>{session.data.seed.property.name}</dd>
              </div>
              <div>
                <dt>Id</dt>
                <dd>
                  <code>{session.data.seed.property.id}</code>
                </dd>
              </div>
              <div>
                <dt>Zona horaria</dt>
                <dd>{session.data.seed.property.timezone}</dd>
              </div>
              <div>
                <dt>Dirección</dt>
                <dd>{session.data.seed.property.addressLine}</dd>
              </div>
            </dl>
            <h4 className="demo-card__sub">Habitaciones</h4>
            <ul className="demo-card__list demo-card__list--compact">
              {session.data.seed.rooms.map((r) => (
                <li key={r.id}>
                  <strong>{r.code}</strong> — capacidad {r.capacity}, planta {r.floor}{" "}
                  (<code>{r.id}</code>)
                </li>
              ))}
            </ul>
            <h4 className="demo-card__sub">Reservas iniciales (estado de partida)</h4>
            {session.data.seed.reservations.length === 0 ? (
              <p className="demo-card__empty">Sin reservas en el seed.</p>
            ) : (
              <ul className="demo-card__list demo-card__list--compact">
                {session.data.seed.reservations.map((r) => (
                  <li key={r.id}>
                    Estado <strong>{r.state}</strong>: {r.checkInDate} → {r.checkOutDate},{" "}
                    habitación <code>{r.roomId}</code>, huésped{" "}
                    <code>{r.guestActorId}</code>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="demo-card" aria-labelledby="steps-heading">
            <h3 id="steps-heading" className="demo-card__title">
              Pasos API (orden sugerido)
            </h3>
            <ol className="demo-steps">
              {session.data.steps.map((s) => (
                <li key={s.step} className="demo-steps__item">
                  <div className="demo-steps__head">
                    <span className="demo-steps__num" aria-hidden="true">
                      {s.step}
                    </span>
                    <div>
                      <h4 className="demo-steps__title">{s.title}</h4>
                      <p className="demo-steps__purpose">{s.purpose}</p>
                    </div>
                  </div>
                  <p className="demo-steps__req-line">
                    <strong>{s.request.method}</strong>
                    <code>
                      {s.request.path}
                      {buildQueryString(s.request.query)}
                    </code>
                  </p>
                  {(s.request.headers && Object.keys(s.request.headers).length > 0) ||
                  s.request.body !== undefined ? (
                    <details className="demo-steps__details">
                      <summary>Detalle de la petición</summary>
                      {s.request.headers &&
                        Object.keys(s.request.headers).length > 0 && (
                          <div className="demo-steps__block">
                            <span className="demo-steps__label">Cabeceras</span>
                            <pre className="demo-steps__pre" tabIndex={0}>
                              {JSON.stringify(s.request.headers, null, 2)}
                            </pre>
                          </div>
                        )}
                      {s.request.body !== undefined && (
                        <div className="demo-steps__block">
                          <span className="demo-steps__label">Cuerpo JSON</span>
                          <pre className="demo-steps__pre" tabIndex={0}>
                            {JSON.stringify(s.request.body, null, 2)}
                          </pre>
                        </div>
                      )}
                    </details>
                  ) : null}
                  <p className="demo-steps__expected">
                    Esperado: HTTP <strong>{s.expected.status}</strong> —{" "}
                    {s.expected.responseSummary}
                    {s.expected.errorCodes?.length ? (
                      <>
                        {" "}
                        (códigos de error de negocio:{" "}
                        {s.expected.errorCodes.map((c, i) => (
                          <span key={c}>
                            {i > 0 ? ", " : null}
                            <code>{c}</code>
                          </span>
                        ))}
                        )
                      </>
                    ) : null}
                  </p>
                </li>
              ))}
            </ol>
          </article>
        </>
      )}
    </section>
  );
}
