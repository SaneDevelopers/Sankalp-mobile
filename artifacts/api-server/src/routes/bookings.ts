import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, bookingsTable } from "@workspace/db";
import { CreateBookingBody, UpdateBookingStatusBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// GET /bookings - Retrieve logged-in user's bookings
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const list = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.userId, userId))
      .orderBy(bookingsTable.id);

    res.json(
      list.map((b) => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      }))
    );
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to retrieve bookings" });
  }
});

// POST /bookings - Book a new ritual
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const body = CreateBookingBody.parse(req.body);

    // Generate custom booking ID like SKL-8821
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `SKL-${randNum}`;

    const [booking] = await db
      .insert(bookingsTable)
      .values({
        userId,
        bookingId,
        poojaId: body.poojaId,
        poojaName: body.poojaName,
        panditId: body.panditId,
        panditName: body.panditName,
        panditColor: body.panditColor,
        panditInitials: body.panditInitials,
        date: body.date,
        time: body.time,
        amount: body.amount,
        status: "upcoming",
      })
      .returning();

    res.status(201).json({
      ...booking,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      res.status(400).json({ message: "Validation failed", errors: err.issues });
      return;
    }
    res.status(500).json({ message: err.message || "Failed to place booking" });
  }
});

// PUT /bookings/:id/status - Update booking status (Admin Simulator)
router.put("/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID parameter" });
      return;
    }

    const body = UpdateBookingStatusBody.parse(req.body);

    const [updated] = await db
      .update(bookingsTable)
      .set({ status: body.status })
      .where(eq(bookingsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ message: "Booking not found" });
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
    res.status(500).json({ message: err.message || "Failed to update booking status" });
  }
});

export default router;
