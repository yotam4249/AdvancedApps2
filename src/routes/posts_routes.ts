import express from "express";
const router= express.Router();
import postController from "../controllers/post_controller" 
import { authMiddleware } from "../controllers/auth_controller";


/**
* @swagger
* tags:
*   name: Posts
*   description: The Posts API
*/


router.get("/", postController.getAll.bind(postController));

router.get("/:id", postController.getById.bind(postController));

router.post("/",authMiddleware,postController.create.bind(postController));

router.put("/:id",authMiddleware,postController.update)

router.delete("/",authMiddleware,postController.deleteAll.bind(postController));

router.delete("/:id",authMiddleware,postController.deleteById.bind(postController));


export default router