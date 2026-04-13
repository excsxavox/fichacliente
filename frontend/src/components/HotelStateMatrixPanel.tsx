import { useCallback } from "react";
import { fetchJson } from "../api/client";
import type { HotelStateMatrixResponse } from "../api/types";
import { useAsyncResource } from "../hooks/useAsyncResource";
import "./HotelStateMatrixPanel.css";

function loadStateMatrix() {
  return fetchJson<HotelStateMatrixResponse>("/v1/hotel/state-matrix");
}

function formatTransition(t: { from: string; to: string }) {
  return `${t.from} → ${t.to}`;
}

export function HotelStateMatrixPanel() {
  const load = useCallback(() => loadStateMatrix(), []);
  const matrix = useAsyncResource(load);

  return (
    <section
      className="state-matrix"
      aria-labelledby="state-matrix-heading"
      aria-busy={matrix.status === "loading"}
    >
      <div className="state-matrix__toolbar">
        <div>
          <h2 id="state-matrix-heading" className="state-matrix__title">
            Matriz de estados (hotel)
          </h2>
          <p className="state-matrix__intro" id="state-matrix-desc">
            Fuente de verdad del dominio expuesta por la API: estados de
            habitación y reserva, transiciones permitidas y prohibidas.
          </p>
        </div>
        <button
          type="button"
          className="state-matrix__reload"
          onClick={() => matrix.reload()}
          disabled={matrix.status === "loading"}
          aria-describedby="state-matrix-desc"
        >
          {matrix.status === "loading" ? "Cargando…" : "Actualizar matriz"}
        </button>
      </div>

      {matrix.status === "loading" && (
        <p className="state-matrix__status" role="status">
          Cargando matriz de estados…
        </p>
      )}

      {matrix.status === "error" && (
        <div className="state-matrix__alert" role="alert">
          <strong>No se pudo cargar la matriz de estados.</strong>
          <p className="state-matrix__error-detail">{matrix.message}</p>
          <p className="state-matrix__hint">
            Comprueba que el servidor exponga{" "}
            <code>GET /v1/hotel/state-matrix</code> o ajusta{" "}
            <code>VITE_API_BASE_URL</code>.
          </p>
        </div>
      )}

      {matrix.status === "success" && (
        <>
          <p className="state-matrix__version" role="note">
            Contrato de payload: versión <strong>{matrix.data.version}</strong>.
          </p>

          <div className="state-matrix__grid">
            <article
              className="state-matrix__card"
              aria-labelledby="room-matrix-title"
            >
              <h3 id="room-matrix-title" className="state-matrix__card-title">
                Habitación
              </h3>
              <h4 className="state-matrix__sub">Estados</h4>
              <ul className="state-matrix__chips" aria-label="Estados de habitación">
                {matrix.data.room.states.map((s) => (
                  <li key={s}>
                    <span className="state-matrix__chip">{s}</span>
                  </li>
                ))}
              </ul>
              <h4 className="state-matrix__sub">Transiciones permitidas</h4>
              <ul className="state-matrix__list">
                {matrix.data.room.allowedTransitions.length === 0 ? (
                  <li className="state-matrix__empty">Ninguna definida.</li>
                ) : (
                  matrix.data.room.allowedTransitions.map((t) => (
                    <li key={formatTransition(t)}>{formatTransition(t)}</li>
                  ))
                )}
              </ul>
              <h4 className="state-matrix__sub">Transiciones prohibidas</h4>
              <ul className="state-matrix__list state-matrix__list--muted">
                {matrix.data.room.forbiddenTransitions.length === 0 ? (
                  <li className="state-matrix__empty">Ninguna listada.</li>
                ) : (
                  matrix.data.room.forbiddenTransitions.map((t) => (
                    <li key={formatTransition(t)}>{formatTransition(t)}</li>
                  ))
                )}
              </ul>
              <h4 className="state-matrix__sub">Notas</h4>
              <ul className="state-matrix__notes">
                {matrix.data.room.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </article>

            <article
              className="state-matrix__card"
              aria-labelledby="reservation-matrix-title"
            >
              <h3
                id="reservation-matrix-title"
                className="state-matrix__card-title"
              >
                Reserva
              </h3>
              <h4 className="state-matrix__sub">Estados</h4>
              <ul className="state-matrix__chips" aria-label="Estados de reserva">
                {matrix.data.reservation.states.map((s) => (
                  <li key={s}>
                    <span className="state-matrix__chip">{s}</span>
                  </li>
                ))}
              </ul>
              <h4 className="state-matrix__sub">Estados terminales</h4>
              <ul
                className="state-matrix__chips state-matrix__chips--terminal"
                aria-label="Estados terminales de reserva"
              >
                {matrix.data.reservation.terminalStates.map((s) => (
                  <li key={s}>
                    <span className="state-matrix__chip state-matrix__chip--terminal">
                      {s}
                    </span>
                  </li>
                ))}
              </ul>
              <h4 className="state-matrix__sub">Transiciones permitidas</h4>
              <ul className="state-matrix__list">
                {matrix.data.reservation.allowedTransitions.length === 0 ? (
                  <li className="state-matrix__empty">Ninguna definida.</li>
                ) : (
                  matrix.data.reservation.allowedTransitions.map((t) => (
                    <li key={formatTransition(t)}>{formatTransition(t)}</li>
                  ))
                )}
              </ul>
              <h4 className="state-matrix__sub">Transiciones prohibidas</h4>
              <ul className="state-matrix__list state-matrix__list--muted">
                {matrix.data.reservation.forbiddenTransitions.length === 0 ? (
                  <li className="state-matrix__empty">Ninguna listada.</li>
                ) : (
                  matrix.data.reservation.forbiddenTransitions.map((t) => (
                    <li key={formatTransition(t)}>{formatTransition(t)}</li>
                  ))
                )}
              </ul>
              <h4 className="state-matrix__sub">Notas</h4>
              <ul className="state-matrix__notes">
                {matrix.data.reservation.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </article>
          </div>
        </>
      )}
    </section>
  );
}
