const { Worker } = require("bullmq");
const Scenario = require("../models/scenarioModel");
const Project = require("../models/projectModel");
const { generateScenarios } = require("../testgen/main");
const { getIO } = require("../socket");
const bullMQConfig = require("../config/bullmq.config");
const getNextSequence = require("../utils/autoIncrementHelper");

const worker = new Worker(
  "scenario-gen-queue",
  async (job) => {
    const io = getIO();
    const { usecases, userId } = job.data;
    //console.log("Scenario worker, use cases: ", usecases);
    for (const usecase of usecases) {
      const scenarios = await generateScenarios(usecase.description);
      //console.log("Scenario worker, scenarios: ", scenarios);
      for (const scenario of scenarios) {
        await Scenario.create({
          scenario_id: await getNextSequence("scenarioId", "SC"),
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
  },
  bullMQConfig
);

// Handle stalled jobs
worker.on("stalled", async (job) => {
  console.log(`💥 Job ${job.id} is stalled`);
  const io = getIO();
  const { usecases, userId } = job.data;

  await Project.findByIdAndUpdate(usecases[0].project_id.toString(), {
    status: "Failed",
  });

  io.to(`user:${userId}`).emit("scenario-failed", {
    message: "Scenario generation failed",
  });
});

// Handle failed jobs
worker.on("failed", async (job, err) => {
  console.log(`💥 Job ${job.id} failed`, err);
  const io = getIO();
  const { usecases, userId } = job.data;

  await Project.findByIdAndUpdate(usecases[0].project_id.toString(), {
    status: "Failed",
  });

  io.to(`user:${userId}`).emit("scenario-failed", {
    message: "Scenario generation failed",
  });
});

// Handle paused queue
worker.on("paused", () => {
  console.log("💥 The queue has been paused");
});

module.exports = worker;
