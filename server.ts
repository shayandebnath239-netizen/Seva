import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { db } from "./src/db/index.ts";
import { users } from "./src/db/schema.ts";
import { eq } from "drizzle-orm";
import aiRouter from "./src/routes/ai.ts";
import servicesRouter from "./src/routes/services.ts";
import adminRouter from "./src/routes/admin.ts";
import { initDiscoveryCron } from "./src/services/discoveryEngine.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize background tasks
  initDiscoveryCron();

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/ai", aiRouter);
  app.use("/api/services", servicesRouter);
  app.use("/api/admin", adminRouter);

  // Sync user profile from Firebase to Postgres
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || "";

      // Check if this is the very first user in the system
      const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
      const isFirstUser = existingUsers.length === 0;
      
      const roleToSet = isFirstUser ? 'ADMIN' : 'USER';

      // Upsert user
      const result = await db.insert(users)
        .values({ uid, email, role: roleToSet })
        .onConflictDoUpdate({
          target: users.uid,
          set: { email },
        })
        .returning();

      res.json({ user: result[0] });
    } catch (error: any) {
      console.error("Failed to sync user:", error);
      res.status(500).json({ error: "Failed to sync user profile" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
