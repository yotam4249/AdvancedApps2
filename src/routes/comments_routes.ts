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

/**
 * @openapi
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - postId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the comment
 *         conmment:
 *           type: string
 *           description: The content of the comment
 *         postId:
 *           type: string
 *           description: The id of the post the comment belongs to
 *         owner:
 *           type: string
 *          description: The author of the comment
 *         
 *       example:
 *         id: d5fE_asz
 *         content: This is a comment
 *         postId: abc123
 *         author: John Doe
 */

/**
 * @openapi
 * /comments:
 *   get:
 *     summary: Retrieve a list of comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get("/", commentsController.getAll.bind(commentsController));

/**
 * @openapi
 * /comments/{id}:
 *   get:
 *     summary: Retrieve a single comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: A single comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 */

router.get("/:id", commentsController.getById.bind(commentsController));

router.post("/",authMiddleware,commentsController.create.bind(commentsController));

router.put("/:id",authMiddleware,commentsController.update.bind(commentsController))

router.delete("/",authMiddleware,commentsController.deleteAll.bind(commentsController));

router.delete("/:id",authMiddleware,commentsController.deleteById.bind(commentsController));


export default router