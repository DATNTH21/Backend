const mongoose = require("mongoose");

const Scenario = require("../models/scenarioModel");
const Project = require("../models/projectModel");
const UseCase = require("../models/usecaseModel");
const sendResponse = require("./responseController");

const Bull = require("bull");
const TestCase = require("../models/testcaseModel");
const scenarioGenQueue = new Bull("scenario-gen-queue");
require("../worker/task_gen_scenario");

// Create a new project
exports.generateScenarios = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { use_case_ids } = req.body;
    const usecases = await UseCase.find({ use_case_id: { $in: use_case_ids } });
    if (!usecases || usecases.length === 0) {
      return sendResponse(res, 404, "Use cases not found", null);
    }

    await Project.findByIdAndUpdate(usecases[0].project_id.toString(), {
      status: "Generating scenarios",
    });

    await scenarioGenQueue.add(
      {
        usecases,
        userId: req.user.id,
      },
      {
        backoff: {
          type: "fixed",
          delay: 1000,
        },
        attempts: 2,
      }
    );

    await session.commitTransaction();
    sendResponse(res, 200, "success", null);
  } catch (error) {
    await session.abortTransaction();
    console.error("Transaction failed:", error);
    sendResponse(
      res,
      500,
      "Failed to generate test cases",
      null,
      error.message
    );
  } finally {
    session.endSession();
  }
};

exports.getAllScenariosOfUC = async (req, res) => {
  try {
    const { usecase_id } = req.query;
    const useCase = await UseCase.findOne({ use_case_id: usecase_id });
    if (!useCase) {
      return res.status(404).json({ message: "Use case not found" });
    }
    const scenarios = await Scenario.find({ use_case: useCase._id });
    // console.log("scenarios", scenarios);
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

exports.deleteScenario = async (req, res) => {
  try {
    const { scenarioId } = req.params;

    await TestCase.deleteMany({ scenario: scenarioId });
    await Scenario.findByIdAndDelete(scenarioId);

    return sendResponse(res, 200, "Scenario deleted successfully");
  } catch (error) {
    return sendResponse(
      res,
      500,
      "Error deleting scenario",
      undefined,
      error.message
    );
  }
};
