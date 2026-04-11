import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { loadProductRouting } from "../api/meta";
import { useAsyncResource } from "../hooks/useAsyncResource";
import type { ProductRoutingResponse } from "../api/types";
import type { AsyncState } from "../hooks/useAsyncResource";

type ProductRoutingContextValue = {
  productRouting: AsyncState<ProductRoutingResponse> & { reload: () => void };
};

const ProductRoutingContext = createContext<ProductRoutingContextValue | null>(
  null,
);

export function ProductRoutingProvider({ children }: { children: ReactNode }) {
  const load = useCallback(() => loadProductRouting(), []);
  const productRouting = useAsyncResource(load);

  return (
    <ProductRoutingContext.Provider value={{ productRouting }}>
      {children}
    </ProductRoutingContext.Provider>
  );
}

export function useProductRouting(): ProductRoutingContextValue {
  const ctx = useContext(ProductRoutingContext);
  if (!ctx) {
    throw new Error(
      "useProductRouting debe usarse dentro de ProductRoutingProvider",
    );
  }
  return ctx;
}
