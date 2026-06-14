import { Router, type IRouter } from "express";
import { eq, and, ne } from "drizzle-orm";
import { db, addressesTable } from "@workspace/db";
import { CreateAddressBody, UpdateAddressBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use(requireAuth);

// GET /addresses - Get current user's saved addresses
router.get("/", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const list = await db
      .select()
      .from(addressesTable)
      .where(eq(addressesTable.userId, userId))
      .orderBy(addressesTable.id);

    // Format response to match spec (map database types)
    res.json(
      list.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      }))
    );
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to retrieve addresses" });
  }
});

// POST /addresses - Create a new address
router.post("/", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const body = CreateAddressBody.parse(req.body);

    if (body.isDefault) {
      // Unset previous defaults
      await db
        .update(addressesTable)
        .set({ isDefault: false })
        .where(eq(addressesTable.userId, userId));
    }

    const [addr] = await db
      .insert(addressesTable)
      .values({
        userId,
        label: body.label,
        name: body.name,
        address: body.address,
        phone: body.phone,
        pincode: body.pincode,
        city: body.city,
        isDefault: body.isDefault,
      })
      .returning();

    res.status(201).json({
      ...addr,
      createdAt: addr.createdAt.toISOString(),
      updatedAt: addr.updatedAt.toISOString(),
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      res.status(400).json({ message: "Validation failed", errors: err.issues });
      return;
    }
    res.status(500).json({ message: err.message || "Failed to create address" });
  }
});

// PUT /addresses/:id - Update an address or mark as default
router.put("/:id", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID parameter" });
      return;
    }

    const body = UpdateAddressBody.parse(req.body);

    // Check ownership
    const existing = await db
      .select()
      .from(addressesTable)
      .where(and(eq(addressesTable.id, id), eq(addressesTable.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ message: "Address not found" });
      return;
    }

    if (body.isDefault) {
      // Unset other defaults
      await db
        .update(addressesTable)
        .set({ isDefault: false })
        .where(and(eq(addressesTable.userId, userId), ne(addressesTable.id, id)));
    }

    const [updated] = await db
      .update(addressesTable)
      .set({
        label: body.label,
        name: body.name,
        address: body.address,
        phone: body.phone,
        pincode: body.pincode,
        city: body.city,
        isDefault: body.isDefault,
      })
      .where(eq(addressesTable.id, id))
      .returning();

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
    res.status(500).json({ message: err.message || "Failed to update address" });
  }
});

// DELETE /addresses/:id - Delete an address
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID parameter" });
      return;
    }

    const existing = await db
      .select()
      .from(addressesTable)
      .where(and(eq(addressesTable.id, id), eq(addressesTable.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ message: "Address not found" });
      return;
    }

    await db
      .delete(addressesTable)
      .where(eq(addressesTable.id, id));

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to delete address" });
  }
});

export default router;
