const express = require("express");
const handleAsync = require("../utils/catchAsync");
const router = express.Router();
const testcaseController = require("../controller/testcaseController");
const AccessMiddleware = require("../middlewares/access.middleware");

router.use(handleAsync(AccessMiddleware.checkAccess));

router.post("/", testcaseController.generateTestCases);
router.get("/", testcaseController.getAllTestCasesOfScenario);

module.exports = router;
