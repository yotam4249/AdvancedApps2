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
 *         - comment
 *         - postId
 *         - owner
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the comment
 *         comment:
 *           type: string
 *           description: The content of the comment
 *         postId:
 *           type: string
 *           description: The id of the post the comment belongs to
 *         owner:
 *           type: string
 *           description: The author of the comment
 *         
 *       example:
 *         _id: d5fE_asz
 *         commentt: This is a comment
 *         postId: abc123
 *         owner: John Doe
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
router.get("/", commentsController.getBySender.bind(commentsController));

/**
* @openapi
* /comments/{id}:
*  get:
*     summary: Retrieve a single Comment by its id
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The id of the Comment to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The Comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: The comment was not found
 */


router.get("/:id", commentsController.getById.bind(commentsController));

/**
 * @openapi
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *        - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *               owner:
 *                 type: string
 *               postId:
 *                 type: string
 *             required:
 *               - comment
 *               - owner
 *               - postId
 *     responses:
 *       201:
 *         description: The created comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad Request
 */

router.post("/",authMiddleware,commentsController.create.bind(commentsController));

/**
 * @openapi
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The id of the comment to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: comment not found
 *       500:
 *         description: Internal server error
 */

router.put("/:id",authMiddleware,commentsController.update.bind(commentsController))

/**
 * @openapi
 * /comments:
 *   delete:
 *     summary: Delete all comments
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All comments were deleted
 *       500:
 *         description: Internal server error
 */

router.delete("/",authMiddleware,commentsController.deleteAll.bind(commentsController));

/**
 * @openapi
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: The comment was deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The comment was not found
 *       500:
 *         description: Internal server error
 */

router.delete("/:id",authMiddleware,commentsController.deleteById.bind(commentsController));


export default router