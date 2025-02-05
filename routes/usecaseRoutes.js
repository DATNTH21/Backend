const express = require("express");
const handleAsync = require("../utils/catchAsync");
const router = express.Router();
const usecaseController = require("../controller/usecaseController");
const AccessMiddleware = require("../middlewares/access.middleware");

router.use(handleAsync(AccessMiddleware.checkAccess));

/**
 * @swagger
 * tags:
 *   name: UseCases
 *   description: API for managing use cases.
 */

/**
 * @swagger
 * /usecases:
 *   post:
 *     summary: Create a new use case
 *     description: Creates a new use case for a project.
 *     tags: [UseCases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: string
 *                 description: ID of the associated project
 *               file:
 *                 type: string
 *                 description: Name of the file
 *               description:
 *                 type: string
 *                 description: Description of the use case
 *     responses:
 *       201:
 *         description: Use case created successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/usecases", usecaseController.createUseCases);

router.get("/usecases", usecaseController.getAllUseCases);

module.exports = router;
