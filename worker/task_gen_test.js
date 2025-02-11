const Bull = require("bull");
const { generateTestCases } = require("../testgen/main");
const Scenario = require("../models/scenarioModel");
const TestCase = require("../models/testcaseModel");
const Project = require("../models/projectModel");
const { getIO } = require("../socket");
const testgenQueue = new Bull("test-gen-queue");

// testgenQueue.clean(3600 * 1000);

testgenQueue.process(async (job) => {
  const io = getIO();
  const { data, projectId, userId } = job.data;

  for (const { usecase, scenario_ids } of data) {
    for (const scenario_id of scenario_ids) {
      const scenario = await Scenario.findOne({ scenario_id });

      const testCases = (
        await generateTestCases(usecase.description, scenario)
      ).map((tc) => ({
        ...tc,
        use_case: usecase._id,
        scenario: scenario._id,
        name: tc.testCaseName,
        expected_result: tc.expectedResult,
      }));

      for (const tc of testCases) {
        await TestCase.create(tc);
      }
    }
  }

  await Project.findByIdAndUpdate(projectId, {
    status: "Done",
  });

  console.log("test cases generated successfully");
  io.to(`user:${userId}`).emit("test-cases-generated", {
    message: "Test cases generated successfully",
  });
});

// testgenQueue.on("completed", async (job) => {
//   console.log("completed 💥");
//   const finalTestcases = await job.returnvalue;
//   global.io.emit("job-completed", { testcases: finalTestcases });
//   console.log("completed 💥", { finalTestcases });
// });

// testgenQueue.on("progress", function (job, progress) {
//   global.io.emit("job-progress", { jobId: job.id, progress });
//   console.log(`💥Job ${job.id} is ${progress}% ready!`);
// });

testgenQueue.on("stalled", function (job) {
  console.log(`💥Job ${job.id} is stalled`);
});

testgenQueue.on("failed", function (job, err) {
  console.log(`💥Job ${job.id} failed`, err);
});

testgenQueue.on("paused", function () {
  console.log("💥The queue has been paused");
});
