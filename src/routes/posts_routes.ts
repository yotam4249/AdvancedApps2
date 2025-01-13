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


/**
 * @openapi
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the post
 *         title:
 *           type: string
 *           description: The title of the post
 *         content:
 *           type: string
 *           description: The content of the post
 *         owner:
 *           type: string
 *           description: The author of the post 
 *       example:
 *         id: d5fE_asz
 *         title: My first post
 *         content: This is the content of my first post
 *         owner: John Doe
 */

/**
 * @openapi
 * /posts:
 *   get:
 *     summary: Retrieve a list of all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */

router.get("/", postController.getAll.bind(postController));

router.get("/:id", postController.getById.bind(postController));
/**
 * @openapi
 * /posts:
 *   post:
 *     summary: Creates a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *             required:
 *               - title
 *               - content
 *     responses:
 *       201:
 *         description: The created post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad Request
 */
router.post("/",authMiddleware,postController.create.bind(postController));

router.put("/:id",authMiddleware,postController.update)

router.delete("/",authMiddleware,postController.deleteAll.bind(postController));

router.delete("/:id",authMiddleware,postController.deleteById.bind(postController));


export default router