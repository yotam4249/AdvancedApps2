import express from "express";
const router= express.Router();
import authController from "../controllers/auth_controller" 

/**
* @swagger
* tags:
*   name: Auth
*   description: The Authentication API
*/


/**
* @swagger
* components:
*   securitySchemes:
*       bearerAuth:
*           type: http
*           scheme: bearer
*           bearerFormat: JWT
*/

/**
* @swagger
*   components:
*       schemas:
*           User:
*               type: object
*               required:
*                   - email
*                   - password
*               properties:
*                   email:
*                       type: string
*                       description: The user email
*                   password:
*                       type: string
*                       description: The user password
*               example:
*                   email: 'test@user.com'
*                   password: 'testpassword'
*/



/**
* @swagger
* /auth/register:
*   post:
*       summary: registers a new user
*       tags: [Auth]
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       $ref: '#/components/schemas/User'
*       responses:
*           200:
*               description: The new user
*               content:
*                   application/json:
*                       schema:
*                           $ref: '#/components/schemas/User'
*/

router.post("/register", authController.register);


/**
* @swagger
* /auth/login:
*   post:
*       summary: login to user
*       tags: [Auth]
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       $ref: '#/components/schemas/User'
*       responses:
*           200:
*               description: The user
*               content:
*                   application/json:
*                       schema:
*                           $ref: '#/components/schemas/User'
*/

router.post("/login", authController.login);



/**
* @swagger
* /auth/logout:
*   post:
*       summary: logout
*       tags: [Auth]
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       $ref: '#/components/schemas/User'
*       responses:
*           200:
*               description: The user
*               content:
*                   application/json:
*                       schema:
*                           $ref: '#/components/schemas/User'
*/

router.post("/logout", authController.logout);

/**
* @swagger
* /auth/refresh:
*   post:
*       summary: Refresh Token
*       tags: [Auth]
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       $ref: '#/components/schemas/User'
*       responses:
*           200:
*               description: The user
*               content:
*                   application/json:
*                       schema:
*                           $ref: '#/components/schemas/User'
*/

router.post("/refresh", authController.refresh);
export default router