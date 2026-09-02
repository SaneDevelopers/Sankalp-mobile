import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route handler to resolve "Cannot GET /"
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "Sankalp API Server",
    message: "Sankalp API Server is live and healthy 🚀",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      pandits: "/api/pandits",
      storeItems: "/api/store-items",
      bookings: "/api/bookings",
      orders: "/api/orders"
    }
  });
});

app.use("/api", router);

// Direct alias routes so /auth/google/callback and /api/auth/google/callback both work
app.use("/auth", router);

app.get("/payment/checkout", (req, res) => {
  res.redirect(`/api/payment/checkout?${new URLSearchParams(req.query as any).toString()}`);
});

export default app;
