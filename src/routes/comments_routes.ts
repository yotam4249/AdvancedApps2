import express from "express";
const router= express.Router();
import commentsController from "../controllers/comments_controller" 
import { authMiddleware } from "../controllers/auth_controller";


/**
* @swagger
* tags:
*   name: Comments
*   description: The Comments API
*/


router.get("/", commentsController.getAll.bind(commentsController));

router.get("/:id", commentsController.getById.bind(commentsController));

router.post("/",authMiddleware,commentsController.create.bind(commentsController));

router.put("/:id",authMiddleware,commentsController.update.bind(commentsController))

router.delete("/",authMiddleware,commentsController.deleteAll.bind(commentsController));

router.delete("/:id",authMiddleware,commentsController.deleteById.bind(commentsController));


export default router