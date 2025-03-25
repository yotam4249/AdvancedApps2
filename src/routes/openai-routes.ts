import express from "express";
import { generateResponse } from "../controllers/openai_controller";

const router = express.Router();

router.post("/generate", generateResponse);

export default router;