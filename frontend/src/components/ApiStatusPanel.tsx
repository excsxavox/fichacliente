import { useCallback, useMemo } from "react";
import { fetchJson } from "../api/client";
import type { HealthResponse, StackMetaResponse } from "../api/types";
import { useProductRouting } from "../context/ProductRoutingContext";
import { useAsyncResource } from "../hooks/useAsyncResource";
import "./ApiStatusPanel.css";

function loadHealth() {
  return fetchJson<HealthResponse>("/health");
}

function loadStackMeta() {
  return fetchJson<StackMetaResponse>("/v1/meta/stack");
}

export function ApiStatusPanel() {
  const { productRouting } = useProductRouting();
  const healthLoad = useCallback(() => loadHealth(), []);
  const metaLoad = useCallback(() => loadStackMeta(), []);

  const health = useAsyncResource(healthLoad);
  const meta = useAsyncResource(metaLoad);

  const allLoading =
    health.status === "loading" ||
    meta.status === "loading" ||
    productRouting.status === "loading";
  const anyError =
    health.status === "error" ||
    meta.status === "error" ||
    productRouting.status === "error";

  const errorMessages = useMemo(() => {
    const out: string[] = [];
    if (health.status === "error") out.push(`Health: ${health.message}`);
    if (meta.status === "error") out.push(`Stack: ${meta.message}`);
    if (productRouting.status === "error")
      out.push(`Convivencia producto: ${productRouting.message}`);
    return out;
  }, [health, meta, productRouting]);

  return (
    <section className="panel" aria-busy={allLoading}>
      <div className="panel__toolbar">
        <p className="panel__intro" id="panel-desc">
          Comprueba la conectividad con el BFF, las notas de política de
          seguridad y la convivencia Ficha Cliente / reservas hoteles expuesta
          en <code className="panel__inline-code">/v1/meta/product-routing</code>
          .
        </p>
        <button
          type="button"
          className="panel__reload"
          onClick={() => {
            health.reload();
            meta.reload();
            productRouting.reload();
          }}
          disabled={allLoading}
          aria-describedby="panel-desc"
        >
          {allLoading ? "Actualizando…" : "Volver a cargar"}
        </button>
      </div>

      {allLoading && (
        <p className="panel__state" role="status">
          Cargando estado del servicio…
        </p>
      )}

      {anyError && !allLoading && (
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

      {!allLoading && health.status === "success" && (
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

      {!allLoading && meta.status === "success" && (
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
          </dl>
          <h4 className="card__sub">Notas de seguridad / PII</h4>
          <ul className="card__list">
            {meta.data.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </article>
      )}

      {!allLoading && productRouting.status === "success" && (
        <article className="card" aria-labelledby="routing-heading">
          <h3 id="routing-heading" className="card__title">
            Convivencia producto (API)
          </h3>
          <p className="card__lead">
            Versión <code>{productRouting.data.version}</code> · actualizado{" "}
            <time dateTime={productRouting.data.updated}>
              {new Date(productRouting.data.updated).toLocaleString("es")}
            </time>
          </p>
          <h4 className="card__sub">REST (único prefijo {productRouting.data.api.restPrefix})</h4>
          <dl className="card__dl">
            <div>
              <dt>Hoteles — listado</dt>
              <dd>
                <code>{productRouting.data.api.hotels.searchAndList}</code>
              </dd>
            </div>
            <div>
              <dt>Hoteles — detalle</dt>
              <dd>
                <code>{productRouting.data.api.hotels.detailPattern}</code>
              </dd>
            </div>
            <div>
              <dt>Solicitudes reserva</dt>
              <dd>
                <code>{productRouting.data.api.hotels.bookingRequests}</code>
              </dd>
            </div>
            <div>
              <dt>Ficha Cliente</dt>
              <dd>
                <code>{productRouting.data.api.fichaCliente.resourcePrefix}</code>
              </dd>
            </div>
          </dl>
          <p className="card__note">{productRouting.data.api.fichaCliente.note}</p>
          <h4 className="card__sub">SPA</h4>
          <dl className="card__dl">
            <div>
              <dt>Home compartida</dt>
              <dd>{productRouting.data.frontend.sharedHome ? "Sí" : "No"}</dd>
            </div>
            <div>
              <dt>Ficha Cliente (ruta)</dt>
              <dd>
                <code>{productRouting.data.frontend.pathPrefixes.fichaCliente}</code>
              </dd>
            </div>
            <div>
              <dt>MVP hoteles (ruta)</dt>
              <dd>
                <code>{productRouting.data.frontend.pathPrefixes.hotelsMvp}</code>
              </dd>
            </div>
            <div>
              <dt>Nombre sección hoteles (UI)</dt>
              <dd>{productRouting.data.frontend.uiNaming.hotelsSection}</dd>
            </div>
          </dl>
        </article>
      )}

      {!allLoading &&
        health.status === "success" &&
        meta.status === "success" &&
        productRouting.status === "success" && (
          <p className="panel__empty-note" role="note">
            No hay más datos en esta pantalla de arranque; las secciones de ficha
            (información, productos, call center) y el flujo{" "}
            {productRouting.data.frontend.uiNaming.hotelsSection.toLowerCase()}{" "}
            se integrarán en iteraciones posteriores.
          </p>
        )}
    </section>
  );
}
