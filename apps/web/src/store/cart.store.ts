import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductVariant, Product } from "@/lib/api";

export interface CartItem {
    variantId: string;
    productId: string;
    productSlug: string;
    nameFr: string;
    nameAr: string;
    nameEn: string;
    image: string;
    colorNameFr: string;
    colorNameAr: string;
    colorNameEn: string;
    size?: string;
    price: number;
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
    removeItem: (variantId: string) => void;
    updateQty: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    total: () => number;
    itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            addItem: (product, variant, quantity = 1) => {
                set((state) => {
                    const existing = state.items.find((i) => i.variantId === variant.id);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.variantId === variant.id
                                    ? { ...i, quantity: i.quantity + quantity }
                                    : i
                            ),
                            isOpen: true,
                        };
                    }
                    const newItem: CartItem = {
                        variantId: variant.id,
                        productId: product.id,
                        productSlug: product.slug,
                        nameFr: product.nameFr,
                        nameAr: product.nameAr,
                        nameEn: product.nameEn,
                        image: product.images[0] ?? "",
                        colorNameFr: variant.colorNameFr,
                        colorNameAr: variant.colorNameAr,
                        colorNameEn: variant.colorNameEn,
                        size: variant.size,
                        price: product.price,
                        quantity,
                    };
                    return { items: [...state.items, newItem], isOpen: true };
                });
            },

            removeItem: (variantId) =>
                set((state) => ({
                    items: state.items.filter((i) => i.variantId !== variantId),
                })),

            updateQty: (variantId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(variantId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) =>
                        i.variantId === variantId ? { ...i, quantity } : i
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),
            total: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
            itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
        }),
        { name: "imad-store-cart" }
    )
);
