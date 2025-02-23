const mongoose = require("mongoose");
const sendResponse = require("./responseController");
const UseCase = require("../models/usecaseModel");
const Project = require("../models/projectModel");
const Scenario = require("../models/scenarioModel");
const TestCase = require("../models/testcaseModel");
const testgenQueue = require("../queue/testGenQueue");
require("../worker/task_gen_test");

// testgenQueue.clean(3600 * 1000);
exports.generateTestCases = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log(req.body);
    const use_case_ids = req.body.map((item) => item.use_case_id);

    const usecases = await UseCase.find({ use_case_id: { $in: use_case_ids } });

    if (!usecases || usecases.length === 0) {
      return sendResponse(res, 404, "Use cases not found", null);
    }

    const data = req.body.map((item) => ({
      usecase: usecases.find(
        (usecase) => usecase.use_case_id === item.use_case_id
      ),
      scenario_ids: item.scenario_ids,
    }));

    const projectId = usecases[0].project_id;

    await Project.findByIdAndUpdate(
      projectId.toString(),
      { status: "Generating test cases" },
      { session }
    );

    // Add job to queue
    await testgenQueue.add(
      "test gen",
      {
        data,
        projectId,
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

exports.getAllTestCases = async (req, res) => {
  try {
    const { scenario_id, use_case_id, project_id } = req.query;
    let filter = {};
    if (scenario_id) {
      const scenario = await Scenario.findOne({ scenario_id });
      if (!scenario) {
        return sendResponse(res, 404, "scenario not found ", null);
      }
      filter.scenario = scenario._id;
    }
    if (use_case_id) {
      const usecase = await UseCase.findOne({ use_case_id });
      if (!usecase) {
        return sendResponse(res, 404, "usecase not found ", null);
      }
      filter.use_case = usecase._id;
    }
    if (project_id) {
      const project = await Project.findOne({ _id: project_id });
      if (!project) {
        return sendResponse(res, 404, "project not found ", null);
      }
      filter.project = project._id;
    }

    const testcases = await TestCase.find(filter);

    return sendResponse(res, 200, "get all scenarios successfully", testcases);
  } catch (error) {
    return sendResponse(
      res,
      500,
      "Failed to get scenarios",
      undefined,
      error.message
    );
  }
};

exports.updateTestCase = async (req, res) => {
  try {
    const testCase = await TestCase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!testCase) {
      return next(new AppError("No test case found with that id", 404));
    }

    return sendResponse(res, 200, "Test case updated successfully", testCase);
  } catch (error) {
    return sendResponse(
      res,
      500,
      "Failed to update test case",
      undefined,
      error.message
    );
  }
};

exports.deleteTestCase = async (req, res) => {
  try {
    await TestCase.findByIdAndDelete(req.params.id);

    return sendResponse(res, 200, "Test case deleted successfully");
  } catch (error) {
    return sendResponse(
      res,
      500,
      "Error deleting test case",
      undefined,
      error.message
    );
  }
};
