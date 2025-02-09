const Bull = require("bull");
const { getIO } = require("../socket");
const { generateUseCaseName } = require("../testgen/main");
const UseCase = require("../models/usecaseModel");
const ucNameGenQueue = new Bull("uc-name-gen-queue");

// ucNameGenQueue.clean(3600 * 1000);
ucNameGenQueue.process(async (job) => {
  const io = getIO();
  const { usecaseContents, project_id, userId } = job.data;

  for (const usecaseContent of usecaseContents) {
    const name = await generateUseCaseName(usecaseContent);
    await UseCase.create({
      project_id,
      name: name,
      description: usecaseContent,
    });
  }

  io.to(`user:${userId}`).emit("use-case-generated", {
    message: "Use case created successfully",
  });
});

ucNameGenQueue.on("stalled", function (job) {
  console.log(`💥Job ${job.id} is stalled`);
});

ucNameGenQueue.on("failed", function (job, err) {
  console.log(`💥Job ${job.id} failed`, err);
});

ucNameGenQueue.on("paused", function () {
  console.log("💥The queue has been paused");
});
