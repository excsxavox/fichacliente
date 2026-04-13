import { ApiStatusPanel } from "./components/ApiStatusPanel";
import { HotelRulesPanel } from "./components/HotelRulesPanel";
import { HotelStateMatrixPanel } from "./components/HotelStateMatrixPanel";
import "./App.css";

export function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Ficha Cliente</h1>
        <p className="app__subtitle">
          MVP gestión hotelera: conectividad con la API, matriz de estados y
          contrato de reglas (cancelación, no-show, cambio de habitación) bajo{" "}
          <code>/v1</code>.
        </p>
      </header>
      <main className="app__main">
        <section aria-labelledby="api-status-heading">
          <h2 id="api-status-heading" className="visually-hidden">
            Estado de la API
          </h2>
          <ApiStatusPanel />
        </section>
        <HotelStateMatrixPanel />
        <HotelRulesPanel />
      </main>
    </div>
  );
}
