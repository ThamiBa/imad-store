import { Router, IRouter } from "express";
import { createPaymentIntent, handleWebhook } from "../controllers/payment.controller";

export const paymentRoutes: IRouter = Router();

// Called by frontend before confirming Stripe payment
paymentRoutes.post("/create-intent", createPaymentIntent);

// Called by Stripe (raw body — parsed in index.ts before express.json)
paymentRoutes.post("/webhook", handleWebhook);
