import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

/**
 * Identity echo for the client.
 *
 * The UI calls this after mount instead of trusting localStorage, which is what
 * makes private routes reload-safe: the cookie is the only source of truth.
 */
router.get("/me", requireAuth, (req, res) => {
  res.json({ success: true, data: req.user });
});

export default router;
