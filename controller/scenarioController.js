const Scenario = require("../models/scenarioModel");
const UseCase = require("../models/usecaseModel");
const sendResponse = require("./responseController");

const Bull = require("bull");
const catchAsync = require("../utils/catchAsync");
const scenarioGenQueue = new Bull("scenario-gen-queue");
require("../worker/task_gen_scenario");

// Create a new project
exports.generateScenarios = catchAsync(async (req, res) => {
  const { use_case_ids } = req.body;
  const usecases = await UseCase.find({ use_case_id: { $in: use_case_ids } });
  if (!usecases || usecases.length === 0) {
    return sendResponse(res, 404, "Use cases not found", null);
  }

  await scenarioGenQueue.add(
    {
      usecases,
    },
    {
      backoff: {
        type: "fixed",
        delay: 1000,
      },
      attempts: 2,
    }
  );

  return sendResponse(res, 200, "Create project successfully", {});
});

exports.getAllScenariosOfUC = async (req, res) => {
  console.log("getAllScenariosOfUC");
  try {
    const { usecase_id } = req.query;
    const useCase = await UseCase.findOne({ use_case_id: usecase_id });
    if (!useCase) {
      return res.status(404).json({ message: "Use case not found" });
    }
    const scenarios = await Scenario.find({ use_case: useCase._id });

    return sendResponse(res, 200, "get all scenarios successfully", scenarios);
  } catch (error) {
    return sendResponse(
      res,
      500,
      "Failed to create project",
      undefined,
      error.message
    );
  }
};
