import { Router } from "express";
import { db } from "../db/index.ts";
import { services } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth.ts";
import { runDiscovery } from "../services/discoveryEngine.ts";

const router = Router();

// Require admin for all routes in this router
router.use(requireAuth, requireAdmin);

// GET /api/admin/queue - List unpublished or unverified services
router.get("/queue", async (req, res) => {
  try {
    const queue = await db.select()
      .from(services)
      .where(eq(services.verificationStatus, 'UNPUBLISHED'))
      .limit(50);
      
    res.json({ services: queue });
  } catch (error) {
    console.error("Failed to fetch admin queue:", error);
    res.status(500).json({ error: "Failed to fetch verification queue" });
  }
});

// POST /api/admin/verify/:id - Publish an ingested scheme
router.post("/verify/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const result = await db.update(services)
      .set({ 
        verificationStatus: 'VERIFIED',
        lastVerifiedAt: new Date()
      })
      .where(eq(services.id, id))
      .returning();

    if (!result.length) return res.status(404).json({ error: "Service not found" });

    res.json({ success: true, service: result[0] });
  } catch (error) {
    console.error("Failed to verify service:", error);
    res.status(500).json({ error: "Failed to verify service" });
  }
});

// POST /api/admin/trigger-discovery - Manually trigger the discovery engine
router.post("/trigger-discovery", async (req, res) => {
  try {
    // Run it asynchronously so we don't block the HTTP response
    runDiscovery().catch(console.error);
    res.json({ message: "Discovery engine triggered successfully. Processing in background." });
  } catch (error) {
    console.error("Failed to trigger discovery:", error);
    res.status(500).json({ error: "Failed to trigger discovery engine" });
  }
});

export default router;
