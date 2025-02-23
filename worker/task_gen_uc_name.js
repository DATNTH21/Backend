const { Worker } = require("bullmq");
const { getIO } = require("../socket");
const { generateUseCaseName } = require("../testgen/main");
const UseCase = require("../models/usecaseModel");
const bullMQConfig = require("../config/bullmq.config");

const worker = new Worker(
  "uc-name-gen-queue",
  async (job) => {
    const io = getIO();
    const { usecaseContents, project_id, userId } = job.data;
    console.log("Processing use case contents:", usecaseContents);

    const useCasesToCreate = [];

    for (const usecaseContent of usecaseContents) {
      const name = await generateUseCaseName(usecaseContent);
      console.log("Generated use case name:", name);

      useCasesToCreate.push({
        project_id,
        name,
        description: usecaseContent,
      });
    }

    await UseCase.create(useCasesToCreate);

    io.to(`user:${userId}`).emit("use-case-generated", {
      message: "Use cases created successfully",
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
  const { userId } = job.data;

  io.to(`user:${userId}`).emit("use-case-failed", {
    message: "Use case creation failed",
  });
});

// Handle paused queue
worker.on("paused", () => {
  console.log("💥 The queue has been paused");
});

module.exports = worker;
