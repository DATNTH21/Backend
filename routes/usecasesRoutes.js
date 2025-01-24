const express = require("express");
const usecasesController = require("../controller/usecasesController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Use Cases
 *   description: API for managing use cases and generating test cases.
 */

/**
 * @swagger
 * /api/v1/usecases/:
 *   post:
 *     summary: Upload a use case file and create test cases
 *     description: Uploads a use case file and generates test cases based on the uploaded file.
 *     tags: [Use Cases]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The use case file to upload
 *     responses:
 *       201:
 *         description: Test cases created successfully
 *       400:
 *         description: Invalid file format or data
 *       500:
 *         description: Server error during file processing
 */
router
  .route("/")
  .post(
    usecasesController.uploadUsecaseFile,
    usecasesController.createTestcases
  );

module.exports = router;
