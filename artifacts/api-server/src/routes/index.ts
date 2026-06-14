import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import addressesRouter from "./addresses";
import bookingsRouter from "./bookings";
import ordersRouter from "./orders";
import panditsRouter from "./pandits";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/addresses", addressesRouter);
router.use("/bookings", bookingsRouter);
router.use("/orders", ordersRouter);
router.use("/pandits", panditsRouter);

export default router;
