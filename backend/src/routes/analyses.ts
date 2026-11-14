import { Router } from "express";
import { createAnalysisController, deleteAnalysisController, getAnalysisController, getChecklistController, listAnalysisController, updateChecklistController } from "../controllers/analysis.js";

export const analysesRouter = Router();
analysesRouter.get("/", listAnalysisController);
analysesRouter.post("/", createAnalysisController);
analysesRouter.get("/:id/checklist", getChecklistController);
analysesRouter.patch("/:id/checklist", updateChecklistController);
analysesRouter.get("/:id", getAnalysisController);
analysesRouter.delete("/:id", deleteAnalysisController);
