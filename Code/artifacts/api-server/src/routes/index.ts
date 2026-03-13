import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import projectsRouter from "./projects/index.js";
import graphRouter from "./projects/graph.js";
import githubRouter from "./search/github.js";
import scholarRouter from "./search/scholar.js";
import openaiAnalysisRouter from "./openai/analysis.js";
import chintuRouter from "./openai/chintu.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/projects", projectsRouter);
router.use(graphRouter);
router.use("/search", githubRouter);
router.use("/search", scholarRouter);
router.use("/openai", openaiAnalysisRouter);
router.use("/openai", chintuRouter);

export default router;
