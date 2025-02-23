const { Worker } = require("bullmq");
const { generateTestCases } = require("../testgen/main");
const Scenario = require("../models/scenarioModel");
const TestCase = require("../models/testcaseModel");
const Project = require("../models/projectModel");
const { getIO } = require("../socket");
const bullMQConfig = require("../config/bullmq.config");
const getNextSequence = require("../utils/autoIncrementHelper");

const worker = new Worker(
  "test-gen-queue",
  async (job) => {
    const io = getIO();
    const { data, projectId, userId } = job.data;

    for (const { usecase, scenario_ids } of data) {
      for (const scenario_id of scenario_ids) {
        const scenario = await Scenario.findOne({ scenario_id });

        const testCases = await Promise.all(
          (
            await generateTestCases(usecase.description, scenario)
          ).map(async (tc) => ({
            ...tc,
            test_case_id: await getNextSequence("testCaseId", "TC"),
            use_case: usecase._id,
            scenario: scenario._id,
            project: projectId,
            name: tc.testCaseName,
            expected_result: tc.expectedResult,
          }))
        );

        await TestCase.insertMany(testCases, { runValidators: true });

        await Scenario.findByIdAndUpdate(scenario._id, {
          $inc: { test_cases_count: testCases.length },
        });
      }
    }

    await Project.findByIdAndUpdate(projectId, {
      status: "Done",
    });

    console.log("✅ Test cases generated successfully");
    io.to(`user:${userId}`).emit("test-cases-generated", {
      message: "Test cases generated successfully",
    });
  },
  bullMQConfig
);

// Handle stalled jobs
worker.on("stalled", (job) => {
  console.log(`💥 Job ${job.id} is stalled`);
});

// Handle failed jobs
worker.on("failed", async (job, err) => {
  console.log(`💥 Job ${job.id} failed`, err);
  const io = getIO();
  const { projectId, userId } = job.data;

  await Project.findByIdAndUpdate(projectId, {
    status: "Failed",
  });

  io.to(`user:${userId}`).emit("test-cases-failed", {
    message: "Test case generation failed",
  });
});

// Handle paused queue
worker.on("paused", () => {
  console.log("💥 The queue has been paused");
});

module.exports = worker;
