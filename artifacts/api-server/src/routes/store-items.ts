import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, storeItemsTable } from "@workspace/db";
import { CreateStoreItemBody, UpdateStoreItemBody } from "@workspace/api-zod";

const router: IRouter = Router();

const SEED_STORE_ITEMS = [
  {
    name: "Complete Havan Kit",
    price: 1250,
    unit: "100% organic · 750g",
    category: "premium",
    featured: true,
    description: "Complete kit for all havan rituals",
    color: "#C89A3C",
    imageUrl: "",
  },
  {
    name: "Brass Pooja Thali",
    price: 1299,
    unit: "Set of 7 items",
    category: "samagri",
    featured: false,
    description: "Traditional brass thali with all accessories",
    color: "#D4722A",
    imageUrl: "",
  },
  {
    name: "Sandalwood Agarbatti",
    price: 249,
    unit: "Pack of 40 sticks",
    category: "samagri",
    featured: false,
    description: "Pure sandalwood incense sticks",
    color: "#7B4F2E",
    imageUrl: "",
  },
  {
    name: "Rudraksh Mala",
    price: 899,
    unit: "108 beads · 5 Mukhi",
    category: "samagri",
    featured: false,
    description: "Authentic 5 mukhi rudraksh mala",
    color: "#5C3317",
    imageUrl: "",
  },
  {
    name: "Panchamrit Kit",
    price: 399,
    unit: "Ready to use",
    category: "samagri",
    featured: false,
    description: "All ingredients for panchamrit abhishek",
    color: "#C89A3C",
    imageUrl: "",
  },
  {
    name: "Pure Cow Ghee",
    price: 599,
    unit: "500ml · Pure A2",
    category: "samagri",
    featured: false,
    description: "Pure A2 cow ghee for havan and pooja",
    color: "#D4722A",
    imageUrl: "",
  },
  {
    name: "Brass Diya (Set of 5)",
    price: 199,
    unit: "Handcrafted brass",
    category: "utensils",
    featured: false,
    description: "Traditional brass diyas for aarti",
    color: "#C89A3C",
    imageUrl: "",
  },
  {
    name: "Copper Kalash",
    price: 449,
    unit: "500ml · Pure copper",
    category: "utensils",
    featured: false,
    description: "Pure copper water pot for rituals",
    color: "#D4722A",
    imageUrl: "",
  },
];

// Helper to seed store items if table is empty
async function seedStoreItemsIfNeeded() {
  try {
    const existing = await db.select().from(storeItemsTable).limit(1);
    if (existing.length === 0) {
      console.log("Seeding store items...");
      await db.insert(storeItemsTable).values(SEED_STORE_ITEMS);
      console.log("Store items seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding store items:", error);
  }
}

// Seed on load
seedStoreItemsIfNeeded();

// GET all store items
router.get("/", async (req, res) => {
  try {
    const items = await db.select().from(storeItemsTable);
    res.json(items);
    return;
  } catch (error) {
    console.error("Error fetching store items:", error);
    res.status(500).json({ message: "Failed to fetch store items" });
    return;
  }
});

// POST create new store item (Admin only)
router.post("/", async (req, res) => {
  try {
    // Basic validation
    const parsed = CreateStoreItemBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.errors[0]?.message || "Validation error" });
      return;
    }

    const [newItem] = await db
      .insert(storeItemsTable)
      .values({
        name: parsed.data.name,
        price: parsed.data.price,
        unit: parsed.data.unit,
        category: parsed.data.category,
        featured: parsed.data.featured ?? false,
        description: parsed.data.description ?? null,
        color: parsed.data.color ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
      })
      .returning();

    res.status(201).json(newItem);
    return;
  } catch (error) {
    console.error("Error creating store item:", error);
    res.status(500).json({ message: "Failed to create store item" });
    return;
  }
});

// PUT update store item (Admin only)
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID parameter" });
      return;
    }

    const parsed = UpdateStoreItemBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.errors[0]?.message || "Validation error" });
      return;
    }

    const [updated] = await db
      .update(storeItemsTable)
      .set({
        name: parsed.data.name,
        price: parsed.data.price,
        unit: parsed.data.unit,
        category: parsed.data.category,
        featured: parsed.data.featured ?? undefined,
        description: parsed.data.description,
        color: parsed.data.color,
        imageUrl: parsed.data.imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(storeItemsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ message: "Store item not found" });
      return;
    }

    res.json(updated);
    return;
  } catch (error) {
    console.error("Error updating store item:", error);
    res.status(500).json({ message: "Failed to update store item" });
    return;
  }
});

// DELETE store item (Admin only)
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID parameter" });
      return;
    }

    const [deleted] = await db
      .delete(storeItemsTable)
      .where(eq(storeItemsTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ message: "Store item not found" });
      return;
    }

    res.json({ success: true });
    return;
  } catch (error) {
    console.error("Error deleting store item:", error);
    res.status(500).json({ message: "Failed to delete store item" });
    return;
  }
});

export default router;
