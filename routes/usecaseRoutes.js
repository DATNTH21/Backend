const express = require("express");
const router = express.Router();
const UseCase = require("../models/usecaseModel"); // Import UseCase model

/**
 * @swagger
 * tags:
 *   name: UseCases
 *   description: API for managing use cases.
 */

/**
 * @swagger
 * /api/v1/usecases:
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
router.post("/usecases", async (req, res) => {
  try {
    const { project_id, file, description } = req.body;

    const newUseCase = new UseCase({
      project_id,
      file,
      description,
    });

    await newUseCase.save();
    res.status(201).json(newUseCase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/usecases/{useCaseId}:
 *   get:
 *     summary: Get a specific use case by use_case_id
 *     description: Retrieves a specific use case by its use_case_id.
 *     tags: [UseCases]
 *     parameters:
 *       - in: path
 *         name: useCaseId
 *         required: true
 *         description: ID of the use case to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Use case details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 use_case_id:
 *                   type: string
 *                 project_id:
 *                   type: string
 *                 file:
 *                   type: string
 *                 description:
 *                   type: string
 *       404:
 *         description: Use case not found
 */
router.get("/usecases/:useCaseId", async (req, res) => {
  try {
    const useCase = await UseCase.findById(req.params.useCaseId);
    if (!useCase) {
      return res.status(404).json({ message: "Use case not found" });
    }
    res.status(200).json(useCase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/usecases/{useCaseId}:
 *   patch:
 *     summary: Update a use case
 *     description: Updates an existing use case by its use_case_id.
 *     tags: [UseCases]
 *     parameters:
 *       - in: path
 *         name: useCaseId
 *         required: true
 *         description: ID of the use case to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 description: Name of the updated file
 *               description:
 *                 type: string
 *                 description: Updated description of the use case
 *     responses:
 *       200:
 *         description: Use case updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Use case not found
 */
router.patch("/usecases/:useCaseId", async (req, res) => {
  try {
    const { file, description } = req.body;
    const updatedUseCase = await UseCase.findByIdAndUpdate(
      req.params.useCaseId,
      { file, description, updated_at: Date.now() },
      { new: true }
    );

    if (!updatedUseCase) {
      return res.status(404).json({ message: "Use case not found" });
    }

    res.status(200).json(updatedUseCase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/usecases/{useCaseId}:
 *   delete:
 *     summary: Delete a use case
 *     description: Deletes a use case by its use_case_id.
 *     tags: [UseCases]
 *     parameters:
 *       - in: path
 *         name: useCaseId
 *         required: true
 *         description: ID of the use case to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Use case deleted successfully
 *       404:
 *         description: Use case not found
 */
router.delete("/usecases/:useCaseId", async (req, res) => {
  try {
    const deletedUseCase = await UseCase.findByIdAndDelete(
      req.params.useCaseId
    );
    if (!deletedUseCase) {
      return res.status(404).json({ message: "Use case not found" });
    }
    res.status(200).json({ message: "Use case deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
