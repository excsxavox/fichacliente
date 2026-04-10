import { ApiStatusPanel } from "./components/ApiStatusPanel";
import "./App.css";

export function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Ficha Cliente</h1>
        <p className="app__subtitle">
          Punto de entrada del front: estado del BFF y metadatos de stack (tarea
          1 — confirmación operativa).
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
