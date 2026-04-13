import { HotelMvpPlaceholder } from "./features/hotel/HotelMvpPlaceholder";
import { ApiStatusPanel } from "./features/system/ApiStatusPanel";
import "./App.css";

export function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Ficha Cliente</h1>
        <p className="app__subtitle">
          BFF H2-FC con convivencia del dominio hotelero bajo{" "}
          <code>/v1/hotel</code>; abajo, estado del servicio y espacio reservado
          para el MVP hotelero.
        </p>
      </header>
      <main className="app__main" aria-labelledby="dashboard-heading">
        <h2 id="dashboard-heading" className="visually-hidden">
          Panel de inicio
        </h2>
        <ApiStatusPanel />
        <HotelMvpPlaceholder />
      </main>
    </div>
  );
}
