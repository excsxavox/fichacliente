import { ApiStatusPanel } from "./components/ApiStatusPanel";
import { useProductRouting } from "./context/ProductRoutingContext";
import "./App.css";

const FALLBACK_SHELL_TITLE = "Ficha Cliente";
const FALLBACK_HOTELS_SECTION = "Reservas hoteles";

export function App() {
  const { productRouting } = useProductRouting();
  const shellTitle =
    productRouting.status === "success"
      ? productRouting.data.frontend.uiNaming.shellTitle
      : FALLBACK_SHELL_TITLE;
  const hotelsSection =
    productRouting.status === "success"
      ? productRouting.data.frontend.uiNaming.hotelsSection
      : FALLBACK_HOTELS_SECTION;
  const hotelsPath =
    productRouting.status === "success"
      ? productRouting.data.frontend.pathPrefixes.hotelsMvp
      : "/app/hotels";

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">{shellTitle}</h1>
        <p className="app__subtitle">
          Home compartida: ficha cliente y{" "}
          <span className="app__hotels-label">{hotelsSection}</span> (ruta
          prevista <code className="app__code">{hotelsPath}</code>
          ). Estado del BFF y política de convivencia vía API.
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
