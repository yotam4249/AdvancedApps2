import express from "express";
const router = express.Router();
import postController from "../controllers/post_controller";
import { authMiddleware } from "../controllers/auth_controller";
import multer = require("multer");
import { Request, Response, NextFunction } from "express";

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
 *         imageUrl:
 *           type: string
 *           description: The URL of the post image (optional)
 *       example:
 *         id: d5fE_asz
 *         title: My first post
 *         content: This is the content of my first post
 *         owner: John Doe
 *         imageUrl: "https://example.com/image.jpg"
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
router.get("/", postController.getBySender.bind(postController));

/**
 * @openapi
 * /posts/{id}:
 *   get:
 *     summary: Retrieve a single post by its id
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The id of the post to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: The post was not found
 */
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
 *               imageUrl:
 *                 type: string
 *                 description: The URL of the post image (optional)
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
router.post("/", authMiddleware, (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.body.imageUrl && typeof req.body.imageUrl !== "string") {
        res.status(400).json({ message: "Invalid imageUrl format" });
        return; // Ensure function exits
    }
    postController.create(req, res);
});

/**
 * @openapi
 * /posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
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
 *               imageUrl:
 *                 type: string
 *                 description: The URL of the post image (optional)
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    if (req.body.imageUrl && typeof req.body.imageUrl !== "string") {
        res.status(400).json({ message: "Invalid imageUrl format" });
        return; // Ensures function does not continue execution
    }
    postController.update(req, res);
});

/**
 * @openapi
 * /posts:
 *   delete:
 *     summary: Delete all posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All posts were deleted
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete("/", authMiddleware, postController.deleteAll.bind(postController));

/**
 * @openapi
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by its id
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The id of the post to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The post was deleted
 *       404:
 *         description: The post was not found
 */
router.delete("/:id", authMiddleware, postController.deleteById.bind(postController));

/**
 * @openapi
 * /posts/{id}/like:
 *   patch:
 *     summary: Like a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The id of the post to like
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post liked successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/like", authMiddleware, postController.like.bind(postController));

/**
 * @openapi
 * /posts/{id}/likes:
 *   get:
 *     summary: Get the number of likes for a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The id of the post to get likes
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Number of likes for the post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id/likes", postController.getLikes.bind(postController));

export default router;

