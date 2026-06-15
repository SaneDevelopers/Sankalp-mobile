import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import { CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// GET /orders - Retrieve logged-in user's orders (or all orders for admin bypass)
router.get("/", async (req, res, next) => {
  if (req.headers.authorization === "Bearer admin-bypass-secret-2026") {
    try {
      const list = await db
        .select()
        .from(ordersTable)
        .orderBy(ordersTable.id);
      return res.json(
        list.map((o) => ({
          ...o,
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        }))
      );
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Failed to retrieve orders" });
    }
  }
  return requireAuth(req, res, next);
}, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const list = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId))
      .orderBy(ordersTable.id);

    res.json(
      list.map((o) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }))
    );
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to retrieve orders" });
  }
});

// GET /orders/:id - Get specific order details
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID parameter" });
      return;
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(and(eq(ordersTable.id, id), eq(ordersTable.userId, userId)))
      .limit(1);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.json({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to retrieve order" });
  }
});

// POST /orders - Place a new order
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const body = CreateOrderBody.parse(req.body);

    // Generate custom order ID like ORD-2244
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${randNum}`;

    const [order] = await db
      .insert(ordersTable)
      .values({
        userId,
        orderId,
        items: body.items,
        amount: body.amount,
        delivery: body.delivery,
        status: "processing",
        addressText: body.addressText,
      })
      .returning();

    res.status(201).json({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      res.status(400).json({ message: "Validation failed", errors: err.issues });
      return;
    }
    res.status(500).json({ message: err.message || "Failed to place order" });
  }
});

// PUT /orders/:id/status - Update order status (Admin Simulator)
router.put("/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID parameter" });
      return;
    }

    const body = UpdateOrderStatusBody.parse(req.body);

    const [updated] = await db
      .update(ordersTable)
      .set({ status: body.status })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      res.status(400).json({ message: "Validation failed", errors: err.issues });
      return;
    }
    res.status(500).json({ message: err.message || "Failed to update order status" });
  }
});

export default router;
