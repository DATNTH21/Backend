const { getIO } = require("../socket");
const { generateUseCaseName } = require("../testgen/main");
const UseCase = require("../models/usecaseModel");
const ucNameGenQueue = require("../queue/ucNameGenQueue");

// ucNameGenQueue.clean(3600 * 1000);
ucNameGenQueue.process(async (job) => {
  const io = getIO();
  const { usecaseContents, project_id, userId } = job.data;
  console.log("usecaseContents: ", usecaseContents);

  for (const usecaseContent of usecaseContents) {
    const name = await generateUseCaseName(usecaseContent);
    console.log("name: ", name);
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
  const io = getIO();
  const { userId } = job.data;
  io.to(`user:${userId}`).emit("use-case-failed", {
    message: "Use case created failed",
  });
  console.log(`💥Job ${job.id} failed`, err);
});

ucNameGenQueue.on("paused", function () {
  console.log("💥The queue has been paused");
});
