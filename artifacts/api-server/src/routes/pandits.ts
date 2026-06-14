import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, panditsTable } from "@workspace/db";
import { CreatePanditBody, UpdatePanditBody } from "@workspace/api-zod";

const router: IRouter = Router();

// Seed data
const SEED_PANDITS = [
  {
    name: "Acharya V. Shastri",
    shortName: "Acharya V. Sh...",
    specialty: "Vedic Rituals Specialist",
    category: "vedic",
    rating: 4.9,
    experience: "15+ Yrs",
    bookings: 1240,
    age: 62,
    city: "Varanasi",
    address: "Vishwanath Gali, Dashashwamedh, Varanasi, UP 221001",
    available: "today",
    initials: "VS",
    avatarColor: "#7B4F2E",
    specializations: ["Vivah Sanskar", "Griha Pravesh", "Satyanarayan", "Rudra Abhishek", "Navagraha"],
    muhurats: ["6:00 AM", "9:30 AM", "11:45 AM", "4:15 PM", "6:30 PM", "7:45 PM"],
    poojas: [
      { id: "p1", name: "Satyanarayan Katha", duration: "1.5 Hrs", price: 2499, includesPrasad: true },
      { id: "p2", name: "Rudra Abhishek", duration: "2 Hrs", price: 4499, includesPrasad: true },
      { id: "p3", name: "Navagraha Shanti", duration: "1 Hr", price: 1999, includesPrasad: false },
      { id: "p4", name: "Griha Pravesh", duration: "2.5 Hrs", price: 3499, includesPrasad: true },
      { id: "p14", name: "Vivah Sanskar", duration: "3 Hrs", price: 7999, includesPrasad: true },
    ],
  },
  {
    name: "Pandit K. Narayanan",
    shortName: "Pandit K. N...",
    specialty: "Astrology & Jyotish Expert",
    category: "astrology",
    rating: 4.8,
    experience: "12 Yrs",
    bookings: 890,
    age: 54,
    city: "Ujjain",
    address: "Mahakal Marg, Ujjain, MP 456001",
    available: "today",
    initials: "KN",
    avatarColor: "#4A3728",
    specializations: ["Kundali Analysis", "Navagraha Puja", "Mangal Dosha", "Shani Shanti", "Lakshmi Puja"],
    muhurats: ["7:00 AM", "10:00 AM", "1:00 PM", "5:00 PM", "7:00 PM"],
    poojas: [
      { id: "p5", name: "Kundali Puja", duration: "1 Hr", price: 1499, includesPrasad: false },
      { id: "p6", name: "Shani Shanti", duration: "1.5 Hrs", price: 2099, includesPrasad: true },
      { id: "p7", name: "Mangal Dosha Puja", duration: "2 Hrs", price: 2799, includesPrasad: true },
      { id: "p15", name: "Lakshmi Puja", duration: "1 Hr", price: 1799, includesPrasad: true },
      { id: "p16", name: "Navagraha Shanti", duration: "1 Hr", price: 1999, includesPrasad: false },
    ],
  },
  {
    name: "Acharya R. Joshi",
    shortName: "Acharya R. J...",
    specialty: "Griha Pravesh Specialist",
    category: "griha",
    rating: 4.7,
    experience: "8 Yrs",
    bookings: 560,
    age: 45,
    city: "Delhi NCR",
    address: "Sector 22, Dwarka, New Delhi 110075",
    available: "tomorrow",
    initials: "RJ",
    avatarColor: "#6B3A2A",
    specializations: ["Griha Pravesh", "Vastu Puja", "Bhoomi Puja", "Office Inauguration", "Ganesh Puja"],
    muhurats: ["8:00 AM", "11:00 AM", "3:00 PM", "6:00 PM"],
    poojas: [
      { id: "p8", name: "Griha Pravesh Puja", duration: "2 Hrs", price: 3499, includesPrasad: true },
      { id: "p9", name: "Vastu Shanti", duration: "1.5 Hrs", price: 2499, includesPrasad: false },
      { id: "p10", name: "Bhoomi Puja", duration: "1 Hr", price: 1799, includesPrasad: false },
      { id: "p17", name: "Lakshmi Puja", duration: "1 Hr", price: 1799, includesPrasad: true },
      { id: "p18", name: "Ganesh Puja", duration: "45 Mins", price: 999, includesPrasad: true },
    ],
  },
  {
    name: "Pandit S. Mishra",
    shortName: "Pandit S. M...",
    specialty: "Havan & Yagna Expert",
    category: "havan",
    rating: 4.6,
    experience: "20 Yrs",
    bookings: 1560,
    age: 68,
    city: "Allahabad",
    address: "Triveni Sangam, Prayagraj, UP 211001",
    available: "today",
    initials: "SM",
    avatarColor: "#5C3317",
    specializations: ["Maha Havan", "Gayatri Yagna", "Navchandi Path", "Durga Saptashati", "Vivah Sanskar"],
    muhurats: ["5:00 AM", "8:30 AM", "12:00 PM", "4:30 PM"],
    poojas: [
      { id: "p11", name: "Maha Havan", duration: "3 Hrs", price: 5999, includesPrasad: true },
      { id: "p12", name: "Gayatri Yagna", duration: "2 Hrs", price: 3999, includesPrasad: true },
      { id: "p13", name: "Navchandi Path", duration: "4 Hrs", price: 7999, includesPrasad: true },
      { id: "p19", name: "Vivah Sanskar", duration: "3 Hrs", price: 7999, includesPrasad: true },
    ],
  },
];

// GET /pandits - Retrieve all pandits (auto-seed if empty)
router.get("/", async (req, res) => {
  try {
    let list = await db.select().from(panditsTable).orderBy(panditsTable.id);

    if (list.length === 0) {
      // Auto seed
      await db.insert(panditsTable).values(SEED_PANDITS);
      list = await db.select().from(panditsTable).orderBy(panditsTable.id);
    }

    res.json(
      list.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    );
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to retrieve pandits" });
  }
});

// POST /pandits - Create a new pandit profile (Admin CRUD)
router.post("/", async (req, res) => {
  try {
    const body = CreatePanditBody.parse(req.body);

    const [pandit] = await db
      .insert(panditsTable)
      .values({
        name: body.name,
        shortName: body.shortName,
        specialty: body.specialty,
        category: body.category,
        rating: body.rating,
        experience: body.experience,
        bookings: body.bookings,
        age: body.age,
        city: body.city,
        address: body.address,
        available: body.available,
        specializations: body.specializations,
        muhurats: body.muhurats,
        poojas: body.poojas,
        initials: body.initials,
        avatarColor: body.avatarColor,
      })
      .returning();

    res.status(201).json({
      ...pandit,
      createdAt: pandit.createdAt.toISOString(),
      updatedAt: pandit.updatedAt.toISOString(),
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      res.status(400).json({ message: "Validation failed", errors: err.issues });
      return;
    }
    res.status(500).json({ message: err.message || "Failed to create pandit" });
  }
});

// PUT /pandits/:id - Update pandit details (Admin CRUD)
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID parameter" });
      return;
    }

    const body = UpdatePanditBody.parse(req.body);

    const [updated] = await db
      .update(panditsTable)
      .set({
        name: body.name,
        shortName: body.shortName,
        specialty: body.specialty,
        category: body.category,
        rating: body.rating,
        experience: body.experience,
        bookings: body.bookings,
        age: body.age,
        city: body.city,
        address: body.address,
        available: body.available,
        specializations: body.specializations,
        muhurats: body.muhurats,
        poojas: body.poojas,
        initials: body.initials,
        avatarColor: body.avatarColor,
      })
      .where(eq(panditsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ message: "Pandit not found" });
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
    res.status(500).json({ message: err.message || "Failed to update pandit" });
  }
});

// DELETE /pandits/:id - Delete a pandit profile (Admin CRUD)
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID parameter" });
      return;
    }

    const [deleted] = await db
      .delete(panditsTable)
      .where(eq(panditsTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ message: "Pandit not found" });
      return;
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to delete pandit" });
  }
});

export default router;
