const Bull = require("bull");
const testgenQueue = new Bull("test-gen-queue");
const generateTestCases = require("../testgen/main");

testgenQueue.process(async (job) => {
  const { usecases } = job.data;

  let progress = 0;
  const finalTestcases = [];
  for (const usecase of usecases) {
    const testCases = await generateTestCases(usecase);
    progress += Math.floor(100 / usecases.length);
    job.progress(progress);
    console.log({ type: typeof testCases, testCases });
    finalTestcases.push(...testCases);
  }
  return finalTestcases;
});

testgenQueue.on("completed", async (job) => {
  console.log("completed 💥");
  const finalTestcases = await job.returnvalue;
  global.io.emit("job-completed", { testcases: finalTestcases });
  console.log("completed 💥", { finalTestcases });
});

testgenQueue.on("progress", function (job, progress) {
  global.io.emit("job-progress", { jobId: job.id, progress });
  console.log(`💥Job ${job.id} is ${progress}% ready!`);
});

testgenQueue.on("stalled", function (job) {
  console.log(`💥Job ${job.id} is stalled`);
});

testgenQueue.on("failed", function (job, err) {
  console.log(`💥Job ${job.id} failed`, err);
});

testgenQueue.on("paused", function () {
  console.log("💥The queue has been paused");
});
