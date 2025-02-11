const mongoose = require("mongoose");
const Counter = require("../models/counterModel");

async function initializeCounters() {
  try {
    const counters = ["scenarioId", "projectId", "testCaseId"];

    for (const counterId of counters) {
      await Counter.findByIdAndUpdate(
        counterId,
        { $setOnInsert: { seq: 0 } },
        { upsert: true }
      );
      console.log(`Counter ${counterId} initialized`);
    }

    console.log("All counters initialized successfully");
  } catch (error) {
    console.error("Error initializing counters:", error);
  }
}

module.exports = initializeCounters;
