const express = require("express");
const router = express.Router();
const projectController = require("../controller/projectController");

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: API for managing projects.
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     description: Creates a new project.
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: string
 *                 description: ID of the project
 *               name:
 *                 type: string
 *                 description: Name of the project
 *               description:
 *                 type: string
 *                 description: Description of the project
 *               users:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: List of user IDs associated with this project
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/projects", projectController.createProject);

/**
 * @swagger
 * /projects/user/{userId}:
 *   get:
 *     summary: Get all projects for a specific user
 *     description: Retrieves all projects associated with the given user ID.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to retrieve projects for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   project_id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *       404:
 *         description: User not found
 */
router.get("/projects/user/:userId", projectController.getProjectsByUser);

/**
 * @swagger
 * /projects/{projectId}:
 *   get:
 *     summary: Get a specific project by project_id
 *     description: Retrieves a specific project by its project ID.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID of the project to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project_id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       404:
 *         description: Project not found
 */
router.get("/projects/:projectId", projectController.getProjectById);

/**
 * @swagger
 * /projects/{projectId}:
 *   patch:
 *     summary: Update a project
 *     description: Updates an existing project by its project ID.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID of the project to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Project not found
 */
router.patch("/projects/:projectId", projectController.updateProject);

/**
 * @swagger
 * /projects/{projectId}:
 *   delete:
 *     summary: Delete a project
 *     description: Deletes a project by its project ID.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID of the project to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete("/projects/:projectId", projectController.deleteProject);

/**
 * @swagger
 * /projects/addUseCase:
 *   post:
 *     summary: Add use case to a project
 *     description: Adds a use case to a project.
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: string
 *                 description: ID of the project
 *               use_case_id:
 *                 type: string
 *                 description: ID of the use case to add
 *     responses:
 *       200:
 *         description: Use case added to project successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Project or Use Case not found
 */
router.post("/projects/addUseCase", projectController.addUseCaseToProject);

module.exports = router;
