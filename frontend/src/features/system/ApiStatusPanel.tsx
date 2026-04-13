import { useCallback } from "react";
import {
  fetchBffStartupSnapshot,
  type BffStartupSnapshot,
} from "../../api/hotel";
import { useAsyncResource } from "../../hooks/useAsyncResource";
import "./ApiStatusPanel.css";

export function ApiStatusPanel() {
  const load = useCallback(() => fetchBffStartupSnapshot(), []);
  const snapshot = useAsyncResource(load);

  return (
    <section className="panel" aria-busy={snapshot.status === "loading"}>
      <div className="panel__toolbar">
        <p className="panel__intro" id="panel-desc">
          Comprueba la conectividad con el BFF y revisa las notas de política de
          seguridad expuestas en metadatos.
        </p>
        <button
          type="button"
          className="panel__reload"
          onClick={() => snapshot.reload()}
          disabled={snapshot.status === "loading"}
          aria-describedby="panel-desc"
        >
          {snapshot.status === "loading" ? "Actualizando…" : "Volver a cargar"}
        </button>
      </div>

      {snapshot.status === "loading" && (
        <p className="panel__state" role="status">
          Cargando estado del servicio…
        </p>
      )}

      {snapshot.status === "error" && (
        <div className="panel__alert" role="alert">
          <strong>No se pudo completar la consulta.</strong>
          <p className="panel__errors panel__errors--single">{snapshot.message}</p>
          <p className="panel__hint">
            Asegúrate de que el BFF esté en ejecución (por defecto puerto 3000) o
            define <code>VITE_API_BASE_URL</code> apuntando a su URL pública.
          </p>
        </div>
      )}

      {snapshot.status === "success" && (
        <StartupCards data={snapshot.data} />
      )}

      {snapshot.status === "success" && (
        <p className="panel__empty-note" role="note">
          No hay más datos en esta pantalla de arranque; las secciones de ficha
          (información, productos, call center) se integrarán en iteraciones
          posteriores. El dominio hotelero se expondrá bajo{" "}
          <code>/v1/hotel</code>.
        </p>
      )}
    </section>
  );
}

function StartupCards({ data }: { data: BffStartupSnapshot }) {
  return (
    <>
      <article className="card" aria-labelledby="health-heading">
        <h3 id="health-heading" className="card__title">
          Salud del servicio
        </h3>
        <dl className="card__dl">
          <div>
            <dt>Estado</dt>
            <dd>{data.health.status}</dd>
          </div>
          <div>
            <dt>Servicio</dt>
            <dd>{data.health.service}</dd>
          </div>
          <div>
            <dt>Ambiente</dt>
            <dd>{data.health.environment}</dd>
          </div>
        </dl>
      </article>

      <article className="card" aria-labelledby="meta-heading">
        <h3 id="meta-heading" className="card__title">
          Stack y políticas (API)
        </h3>
        <dl className="card__dl">
          <div>
            <dt>Repositorio</dt>
            <dd>{data.stackMeta.repository}</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>{data.stackMeta.runtime}</dd>
          </div>
          <div>
            <dt>Lenguaje</dt>
            <dd>{data.stackMeta.language}</dd>
          </div>
          <div>
            <dt>Framework API</dt>
            <dd>{data.stackMeta.framework}</dd>
          </div>
          <div>
            <dt>Prefijo API</dt>
            <dd>
              <code>{data.stackMeta.apiPrefix}</code>
            </dd>
          </div>
        </dl>
        <h4 className="card__sub">Notas de seguridad / PII</h4>
        <ul className="card__list">
          {data.stackMeta.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </article>
    </>
  );
}
