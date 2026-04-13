import { ApiStatusPanel } from "./components/ApiStatusPanel";
import { HotelStateMatrixPanel } from "./components/HotelStateMatrixPanel";
import "./App.css";

export function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Ficha Cliente</h1>
        <p className="app__subtitle">
          MVP gestión hotelera: conectividad con la API y matriz de estados de
          habitación y reserva (dominio expuesto en <code>/v1</code>).
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
      </main>
    </div>
  );
}
