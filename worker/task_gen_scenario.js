const Bull = require("bull");
const Scenario = require("../models/scenarioModel");
const Project = require("../models/projectModel");

const { generateScenarios } = require("../testgen/main");
const scenarioGenQueue = new Bull("scenario-gen-queue");
const { getIO } = require("../socket");

// scenarioGenQueue.clean(3600 * 1000);

scenarioGenQueue.process(async (job) => {
  const io = getIO();
  const { usecases, userId } = job.data;

  for (const usecase of usecases) {
    const scenarios = await generateScenarios(usecase.description);
    for (const scenario of scenarios) {
      await Scenario.create({
        use_case: usecase._id,
        content: scenario,
      });
    }
  }

  await Project.findByIdAndUpdate(usecases[0].project_id.toString(), {
    status: "Done",
  });

  io.to(`user:${userId}`).emit("scenario-generated", {
    message: "Scenarios generated successfully",
  });
});

scenarioGenQueue.on("stalled", function (job) {
  console.log(`💥Job ${job.id} is stalled`);
});

scenarioGenQueue.on("failed", function (job, err) {
  console.log(`💥Job ${job.id} failed`, err);
});

scenarioGenQueue.on("paused", function () {
  console.log("💥The queue has been paused");
});
