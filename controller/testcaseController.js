const Bull = require("bull");
const catchAsync = require("../utils/catchAsync");
const sendResponse = require("./responseController");
const UseCase = require("../models/usecaseModel");
const Project = require("../models/projectModel");
const Scenario = require("../models/scenarioModel");
const TestCase = require("../models/testcaseModel");
const testgenQueue = new Bull("test-gen-queue");
require("../worker/task_gen_test");

// testgenQueue.clean(3600 * 1000);
exports.generateTestCases = catchAsync(async (req, res, next) => {
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

  const projectId = usecases[0].project_id.toString();
  await Project.findByIdAndUpdate(projectId, {
    status: "Generating",
  });

  await testgenQueue.add(
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
  sendResponse(res, 200, "success", null);
});

exports.getAllTestCasesOfScenario = async (req, res) => {
  try {
    const { scenario_id } = req.query;
    const scenario = await Scenario.findOne({ scenario_id });
    if (!scenario) {
      return res.status(404).json({ message: "Scenario not found" });
    }
    const testcases = await TestCase.find({ scenario: scenario._id });

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
