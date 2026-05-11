import { Router } from "express";
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";

export const productRoutes = Router();

// Public
productRoutes.get("/", getProducts);
productRoutes.get("/:slug", getProduct);

// Admin only
productRoutes.post("/", authenticate, requireAdmin, createProduct);
productRoutes.put("/:id", authenticate, requireAdmin, updateProduct);
productRoutes.delete("/:id", authenticate, requireAdmin, deleteProduct);
