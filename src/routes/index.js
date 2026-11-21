import { Router } from "express";
import authRoutes from "./auth.routes.js";

/**
 * Everything under /api (and /api/v1 for the browser through the Next rewrite).
 * Route modules are added here as each block of the plan lands.
 */
export const apiRouter = Router();

apiRouter.use("/auth", authRoutes);

export default apiRouter;
