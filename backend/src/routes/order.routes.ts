import { Router, IRouter } from "express";
import {
    createOrder,
    getMyOrders,
    getOrder,
    getAllOrders,
    updateOrderStatus,
} from "../controllers/order.controller";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";

export const orderRoutes: IRouter = Router();

// Customer
orderRoutes.post("/", createOrder);                              // guest or logged-in
orderRoutes.get("/my", authenticate, getMyOrders);              // logged-in customer orders
orderRoutes.get("/:id", getOrder);                              // order by ID (guest or user)

// Admin
orderRoutes.get("/", authenticate, requireAdmin, getAllOrders);
orderRoutes.patch("/:id/status", authenticate, requireAdmin, updateOrderStatus);
