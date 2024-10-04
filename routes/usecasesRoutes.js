const express = require("express");
const usecasesController = require("../controller/usecasesController");

const router = express.Router();

router
  .route("/")
  .post(
    usecasesController.uploadUsecaseFile,
    usecasesController.createTestcases
  );

module.exports = router;
