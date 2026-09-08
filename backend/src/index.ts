import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "express-async-errors";

import { authRoutes } from "./routes/auth.routes";
import { productRoutes } from "./routes/product.routes";
import { categoryRoutes } from "./routes/category.routes";
import { orderRoutes, notificationRoutes } from "./routes/order.routes";
import { paymentRoutes } from "./routes/payment.routes";
import { addressRoutes } from "./routes/address.routes";
import { settingsRoutes } from "./routes/settings.routes";
import { telegramRoutes } from "./routes/telegram.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { syncSheetsToDatabase } from "./lib/notifications";

const app: Application = express();
const PORT = process.env.PORT ?? 4000;

// ─── Global Middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(","),
        credentials: true,
    })
);
app.use(morgan("dev"));

// raw body for Stripe webhooks — must come BEFORE express.json()
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/settings", settingsRoutes);

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorMiddleware);

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Imad Store API running on http://localhost:${PORT}`);
});

// ─── Background Workers ──────────────────────────────────────────────────────
// Google Sheets → DB sync (polls every 30s)
setInterval(() => {
    syncSheetsToDatabase().catch((err) =>
        console.error("Sheets → DB sync worker error:", err)
    );
}, 30_000);

export default app;
