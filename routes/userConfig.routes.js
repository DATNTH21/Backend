const express = require("express");
const router = express.Router();
const handleAsync = require("../utils/catchAsync");
const UserConfigController = require("../controller/userConfig.controller");
const AccessMiddleware = require("../middlewares/access.middleware");

router.use(handleAsync(AccessMiddleware.checkAccess));

router.get("/", UserConfigController.getUserConfig);

router.put(
  "/test-case-template",
  UserConfigController.updateTestCaseExportTemplate
);

router.post("/option", UserConfigController.addUserConfigOption);

router.delete("/option", UserConfigController.deleteUserConfigOption);

module.exports = router;
