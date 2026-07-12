/**
 * Sub-reducer da disponibilidade de produtos (controle manual e por quantidade).
 */

import type { DemoData } from "@/data/demo";
import type { Product, ProductAvailability } from "@/modules/catalog/types";
import { setProductQuantity } from "@/modules/availability/domain/apply";
import type { DemoAction, DemoState } from "../types";
import { getProduct } from "../selectors";
import { commit, fail } from "./helpers";

type CatalogAction = Extract<
  DemoAction,
  { type: "SET_PRODUCT_MANUAL_AVAILABILITY" | "SET_PRODUCT_QUANTITY" }
>;

function replaceProduct(data: DemoData, product: Product): DemoData {
  return {
    ...data,
    products: data.products.map((p) => (p.id === product.id ? product : p)),
  };
}

export function catalogReducer(state: DemoState, action: CatalogAction): DemoState {
  switch (action.type) {
    case "SET_PRODUCT_MANUAL_AVAILABILITY": {
      const product = getProduct(state.data, action.productId);
      if (!product) {
        return fail(state, "Produto não encontrado.");
      }
      if (product.availability.mode !== "manual") {
        return fail(state, "Este produto não é controlado manualmente.");
      }
      const availability: ProductAvailability = {
        ...product.availability,
        manualAvailable: action.available,
      };
      const data = replaceProduct(state.data, { ...product, availability });
      return commit(
        state,
        { data },
        {
          kind: action.available ? "success" : "info",
          message: action.available
            ? `"${product.name}" marcado como disponível.`
            : `"${product.name}" marcado como indisponível.`,
        },
      );
    }

    case "SET_PRODUCT_QUANTITY": {
      const product = getProduct(state.data, action.productId);
      if (!product) {
        return fail(state, "Produto não encontrado.");
      }
      const updated = setProductQuantity(product, action.quantity);
      if (!updated.ok) {
        return fail(state, updated.error);
      }
      const data = replaceProduct(state.data, updated.value);
      return commit(state, { data }, { kind: "success", message: "Quantidade atualizada." });
    }
  }
}
