const Bull = require("bull");
const Scenario = require("../models/scenarioModel");
const { generateScenarios } = require("../testgen/main");
const scenarioGenQueue = new Bull("scenario-gen-queue");
const { getIO } = require("../socket");

// scenarioGenQueue.clean(3600 * 1000);

scenarioGenQueue.process(async (job) => {
  const io = getIO();
  const { usecases } = job.data;

  let progress = 0;
  for (const usecase of usecases) {
    const scenarios = await generateScenarios(usecase.description);
    for (const scenario of scenarios) {
      await Scenario.create({
        use_case: usecase._id,
        content: scenario,
      });
    }

    progress += Math.floor(100 / usecases.length);
    // job.progress(progress);
    // console.log({ type: typeof testCases, testCases });
  }
});

// scenarioGenQueue.on("completed", async (job) => {
//   console.log("completed 💥");
//   const finalTestcases = await job.returnvalue;
//   global.io.emit("job-completed", { testcases: finalTestcases });
//   console.log("completed 💥", { finalTestcases });
// });

// scenarioGenQueue.on("progress", function (job, progress) {
//   io.emit("scenario-progress", { jobId: job.id, progress });
//   console.log(`💥Job ${job.id} is ${progress}% ready!`);
// });

scenarioGenQueue.on("stalled", function (job) {
  console.log(`💥Job ${job.id} is stalled`);
});

scenarioGenQueue.on("failed", function (job, err) {
  console.log(`💥Job ${job.id} failed`, err);
});

scenarioGenQueue.on("paused", function () {
  console.log("💥The queue has been paused");
});
