import { ApiStatusPanel } from "./components/ApiStatusPanel";
import "./App.css";

export function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Ficha Cliente</h1>
        <p className="app__subtitle">
          Punto de entrada: estado del BFF, documento de alcance MVP de reservas
          (<code>/v1/meta/mvp-scope</code>) y metadatos de stack.
        </p>
      </header>
      <main className="app__main" aria-labelledby="api-status-heading">
        <h2 id="api-status-heading" className="visually-hidden">
          Estado de la API
        </h2>
        <ApiStatusPanel />
      </main>
    </div>
  );
}
