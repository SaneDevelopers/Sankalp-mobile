import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import addressesRouter from "./addresses";
import bookingsRouter from "./bookings";
import ordersRouter from "./orders";
import panditsRouter from "./pandits";
import storeItemsRouter from "./store-items";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/addresses", addressesRouter);
router.use("/bookings", bookingsRouter);
router.use("/orders", ordersRouter);
router.use("/pandits", panditsRouter);
router.use("/store-items", storeItemsRouter);

export default router;
