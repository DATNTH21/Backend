const express = require("express");
const handleAsync = require("../utils/catchAsync");
const router = express.Router();
const scenarioController = require("../controller/scenarioController");
const AccessMiddleware = require("../middlewares/access.middleware");

router.use(handleAsync(AccessMiddleware.checkAccess));
/**
 * @swagger
 * tags:
 *   name: Scenario
 *   description: API for managing scenarios.
 */

router.post("/", scenarioController.generateScenarios);

router.get("/", scenarioController.getAllScenariosOfUC);

module.exports = router;
