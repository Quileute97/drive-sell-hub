import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { ProductCardData } from "@/components/ProductCard";

interface QuickViewContextValue {
  product: ProductCardData | null;
  openQuickView: (product: ProductCardData) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextValue | undefined>(undefined);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<ProductCardData | null>(null);

  const openQuickView = useCallback((next: ProductCardData) => {
    setProduct(next);
  }, []);

  const closeQuickView = useCallback(() => {
    setProduct(null);
  }, []);

  return (
    <QuickViewContext.Provider value={{ product, openQuickView, closeQuickView }}>
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView(): QuickViewContextValue {
  const ctx = useContext(QuickViewContext);
  if (!ctx) {
    return {
      product: null,
      openQuickView: () => {},
      closeQuickView: () => {},
    };
  }
  return ctx;
}

