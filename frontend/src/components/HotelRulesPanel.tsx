import { useCallback } from "react";
import { fetchJson } from "../api/client";
import type { HotelBusinessRulesResponse } from "../api/types";
import { useAsyncResource } from "../hooks/useAsyncResource";
import "./HotelRulesPanel.css";

function loadBusinessRules() {
  return fetchJson<HotelBusinessRulesResponse>("/v1/meta/hotel-business-rules");
}

export function HotelRulesPanel() {
  const load = useCallback(() => loadBusinessRules(), []);
  const rules = useAsyncResource(load);

  return (
    <section
      className="hotel-panel"
      aria-labelledby="hotel-rules-heading"
      aria-busy={rules.status === "loading"}
    >
      <div className="hotel-panel__toolbar">
        <div>
          <h2 id="hotel-rules-heading" className="hotel-panel__title">
            Reglas de negocio (hotel MVP)
          </h2>
          <p className="hotel-panel__intro" id="hotel-panel-desc">
            Contrato público desde{" "}
            <code>GET /v1/meta/hotel-business-rules</code>: cancelación, no-show
            y cambio de habitación. La matriz de estados está en{" "}
            <code>GET /v1/hotel/state-matrix</code>. Las mutaciones futuras
            devolverán <strong>409</strong> con <code>error.code</code> según la
            tabla (el mensaje viene del servidor; la UI no replica reglas).
          </p>
        </div>
        <button
          type="button"
          className="hotel-panel__reload"
          onClick={() => rules.reload()}
          disabled={rules.status === "loading"}
          aria-describedby="hotel-panel-desc"
        >
          {rules.status === "loading" ? "Cargando…" : "Recargar reglas"}
        </button>
      </div>

      {rules.status === "idle" && (
        <p className="hotel-panel__state" role="status">
          Preparando carga…
        </p>
      )}

      {rules.status === "loading" && (
        <p className="hotel-panel__state" role="status">
          Cargando reglas de negocio…
        </p>
      )}

      {rules.status === "error" && (
        <div className="hotel-panel__alert" role="alert">
          <strong>No se pudieron obtener las reglas del hotel.</strong>
          <p className="hotel-panel__err-detail">{rules.message}</p>
          <p className="hotel-panel__hint">
            Comprueba que el BFF esté en marcha o configura{" "}
            <code>VITE_API_BASE_URL</code>. En escritura, los conflictos de
            negocio usan cuerpo{" "}
            <code>{`{ "error": { "code": "…", "message": "…" } }`}</code>.
          </p>
        </div>
      )}

      {rules.status === "success" && (
        <>
          <p className="hotel-panel__ref" role="note">
            Referencia de estados:{" "}
            <span className="hotel-panel__ref-text">
              {rules.data.reservationStatesReference}
            </span>
          </p>

          <article
            className="hotel-card"
            aria-labelledby="hotel-rules-card-heading"
          >
            <h3 id="hotel-rules-card-heading" className="hotel-card__title">
              Reglas (versión {rules.data.version})
            </h3>

            <h4 className="hotel-card__sub">Cancelación</h4>
            <p className="hotel-card__purpose">{rules.data.cancellation.purpose}</p>
            <dl className="hotel-card__dl">
              <div>
                <dt>Desde estados</dt>
                <dd>{rules.data.cancellation.allowedFrom.join(", ")}</dd>
              </div>
              <div>
                <dt>Estado resultante</dt>
                <dd>
                  <code>{rules.data.cancellation.resultingState}</code>
                </dd>
              </div>
              <div>
                <dt>Códigos 409</dt>
                <dd>
                  <ul className="hotel-card__codes">
                    {rules.data.cancellation.httpConflictCodes.map((c) => (
                      <li key={c}>
                        <code>{c}</code>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>

            <h4 className="hotel-card__sub">No-show</h4>
            <p className="hotel-card__purpose">{rules.data.noShow.purpose}</p>
            <dl className="hotel-card__dl">
              <div>
                <dt>Desde estados</dt>
                <dd>{rules.data.noShow.allowedFrom.join(", ")}</dd>
              </div>
              <div>
                <dt>Estado resultante</dt>
                <dd>
                  <code>{rules.data.noShow.resultingState}</code>
                </dd>
              </div>
            </dl>
            <p className="hotel-card__label">Precondiciones</p>
            <ul className="hotel-card__list">
              {rules.data.noShow.preconditions.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="hotel-card__label">Códigos 409</p>
            <ul className="hotel-card__codes hotel-card__codes--inline">
              {rules.data.noShow.httpConflictCodes.map((c) => (
                <li key={c}>
                  <code>{c}</code>
                </li>
              ))}
            </ul>

            <h4 className="hotel-card__sub">Cambio de habitación</h4>
            <p className="hotel-card__purpose">{rules.data.roomChange.purpose}</p>
            <dl className="hotel-card__dl">
              <div>
                <dt>Desde estados</dt>
                <dd>{rules.data.roomChange.allowedFrom.join(", ")}</dd>
              </div>
              <div>
                <dt>Solape persistido</dt>
                <dd>
                  <code>{rules.data.roomChange.persistenceOverlapCode}</code>
                </dd>
              </div>
            </dl>
            {rules.data.roomChange.notes &&
            rules.data.roomChange.notes.length > 0 ? (
              <ul className="hotel-card__list">
                {rules.data.roomChange.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            ) : null}
            <p className="hotel-card__label">Códigos 409</p>
            <ul className="hotel-card__codes hotel-card__codes--inline">
              {rules.data.roomChange.httpConflictCodes.map((c) => (
                <li key={c}>
                  <code>{c}</code>
                </li>
              ))}
            </ul>
          </article>

          <article
            className="hotel-card"
            aria-labelledby="hotel-codes-card-heading"
          >
            <h3 id="hotel-codes-card-heading" className="hotel-card__title">
              Códigos de error de negocio
            </h3>
            <p className="hotel-card__muted">
              Claves estables en <code>error.code</code> (409); el texto asociado
              es orientativo — mostrar siempre el mensaje devuelto por la API.
            </p>
            <dl className="hotel-card__code-map">
              {Object.entries(rules.data.businessErrorCodes).map(
                ([code, desc]) => (
                  <div key={code}>
                    <dt>
                      <code>{code}</code>
                    </dt>
                    <dd>{desc}</dd>
                  </div>
                ),
              )}
            </dl>
          </article>
        </>
      )}
    </section>
  );
}
