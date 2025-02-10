const express = require("express");
const handleAsync = require("../utils/catchAsync");
const router = express.Router();
const testcaseController = require("../controller/testcaseController");
const AccessMiddleware = require("../middlewares/access.middleware");

router.use(handleAsync(AccessMiddleware.checkAccess));

router.post("/", testcaseController.generateTestCases);
router.get("/", testcaseController.getAllTestCases);

// id is mongo _id, not test_case_id
router.patch("/:id", testcaseController.updateTestCase);

module.exports = router;
