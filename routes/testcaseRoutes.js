const express = require("express");
const router = express.Router();
const testcaseController = require("../controller/testcaseController");

router.post("/", testcaseController.generateTestcases);

module.exports = router;
