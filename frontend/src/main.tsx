import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ProductRoutingProvider } from "./context/ProductRoutingContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProductRoutingProvider>
      <App />
    </ProductRoutingProvider>
  </StrictMode>,
);
