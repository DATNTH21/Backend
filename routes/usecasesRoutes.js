const express = require("express");
const usecasesController = require("../controller/usecasesController");

const router = express.Router();

router
  .route("/")
  .post(
    usecasesController.uploadUsecasePhoto,
    usecasesController.setUpPhoto,
    usecasesController.createTestcases
  );

module.exports = router;
