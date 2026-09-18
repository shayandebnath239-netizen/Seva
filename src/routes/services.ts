import { Router } from "express";
import { db } from "../db/index.ts";
import { services, categories, states, officialLinks, documents, serviceDocuments, eligibilityRules, verificationRecords } from "../db/schema.ts";
import { eq, like, or, and } from "drizzle-orm";

const router = Router();

// GET /api/services
router.get("/", async (req, res) => {
  try {
    const query = req.query.q as string;
    
    let conditions = undefined;
    if (query) {
      conditions = or(
        like(services.name, `%${query}%`),
        like(services.description, `%${query}%`)
      );
    }

    const results = await db.select({
      id: services.id,
      name: services.name,
      description: services.description,
      jurisdiction: services.jurisdiction,
      category: { name: categories.name, icon: categories.icon },
      state: { name: states.name }
    })
    .from(services)
    .leftJoin(categories, eq(services.categoryId, categories.id))
    .leftJoin(states, eq(services.stateId, states.id))
    .where(conditions)
    .limit(50);

    res.json({ services: results });
  } catch (error) {
    console.error("Failed to fetch services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// GET /api/services/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const serviceQuery = await db.select({
      id: services.id,
      name: services.name,
      description: services.description,
      jurisdiction: services.jurisdiction,
      verificationStatus: services.verificationStatus,
      lastVerifiedAt: services.lastVerifiedAt,
      nextReviewAt: services.nextReviewAt,
      category: { name: categories.name, icon: categories.icon },
      state: { name: states.name }
    })
    .from(services)
    .leftJoin(categories, eq(services.categoryId, categories.id))
    .leftJoin(states, eq(services.stateId, states.id))
    .where(eq(services.id, id));

    if (!serviceQuery.length) return res.status(404).json({ error: "Service not found" });

    const service = serviceQuery[0];

    const links = await db.select().from(officialLinks).where(eq(officialLinks.serviceId, id));
    
    const docs = await db.select({
      id: documents.id,
      name: documents.name,
      description: documents.description,
      isRequired: serviceDocuments.isRequired,
      notes: serviceDocuments.notes
    })
    .from(serviceDocuments)
    .innerJoin(documents, eq(serviceDocuments.documentId, documents.id))
    .where(eq(serviceDocuments.serviceId, id));

    const rules = await db.select().from(eligibilityRules).where(eq(eligibilityRules.serviceId, id));
    const verificationLogs = await db.select().from(verificationRecords).where(eq(verificationRecords.serviceId, id));

    res.json({
      service,
      officialLinks: links,
      documents: docs,
      eligibilityRules: rules[0] || null,
      verificationRecords: verificationLogs
    });

  } catch (error) {
    console.error("Failed to fetch service detail:", error);
    res.status(500).json({ error: "Failed to fetch service details" });
  }
});

export default router;
