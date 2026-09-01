import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
    headers: { "Content-Type": "application/json" },
});

// Attach token if present
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Category {
    id: string;
    slug: string;
    nameFr: string;
    nameAr: string;
    nameEn: string;
    image?: string;
}

export interface ProductVariant {
    id: string;
    color: string;
    colorNameFr: string;
    colorNameAr: string;
    colorNameEn: string;
    size?: string;
    stock: number;
    sku: string;
}

export interface Product {
    id: string;
    slug: string;
    nameFr: string;
    nameAr: string;
    nameEn: string;
    descriptionFr: string;
    descriptionAr: string;
    descriptionEn: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    status: string;
    category: Category;
    variants: ProductVariant[];
}

export interface ProductsResponse {
    success: boolean;
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
}

export interface OrderPayload {
    guestEmail?: string;
    guestPhone?: string;
    address: {
        fullName: string;
        phone: string;
        street: string;
        city: string;
        region: string;
    };
    paymentMethod: "COD" | "STRIPE";
    items: { variantId: string; quantity: number }[];
    notes?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getProducts = async (params?: {
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
}): Promise<ProductsResponse> => {
    const { data } = await api.get("/products", { params });
    return data;
};

export const getProduct = async (slug: string): Promise<Product> => {
    const { data } = await api.get(`/products/${slug}`);
    return data.data;
};

export const getCategories = async (): Promise<Category[]> => {
    const { data } = await api.get("/categories");
    return data.data;
};

export const createOrder = async (payload: OrderPayload) => {
    const { data } = await api.post("/orders", payload);
    return data.data;
};

export interface AuthResponse {
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
    };
}

export const loginUser = async (payload: any): Promise<AuthResponse> => {
    const { data } = await api.post("/auth/login", payload);
    return data;
};

export const registerUser = async (payload: any): Promise<AuthResponse> => {
    const { data } = await api.post("/auth/register", payload);
    return data;
};

export default api;
