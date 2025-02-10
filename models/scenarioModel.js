const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ScenarioSchema = new Schema(
  {
    scenario_id: { type: String, unique: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    use_case: {
      type: mongoose.Schema.ObjectId,
      ref: "UseCase",
      required: true,
    },
    test_cases_count: { type: Number, default: 0 },
  },
  { collection: "Scenario" }
);

// Pre-save hook to generate custom scenario_id
ScenarioSchema.pre("save", async function (next) {
  if (!this.scenario_id) {
    // Find the highest scenario number
    const highestScenario = await mongoose
      .model("Scenario")
      .findOne({}, { scenario_id: 1 })
      .sort({ scenario_id: -1 });

    let nextNumber = 1;
    if (highestScenario && highestScenario.scenario_id) {
      // Extract number from SC-X format and add 1
      const currentNumber = parseInt(highestScenario.scenario_id.split("-")[1]);
      nextNumber = currentNumber + 1;
    }

    this.scenario_id = `SC-${nextNumber}`;
  }
  next();
});

const Scenario = mongoose.model("Scenario", ScenarioSchema);
module.exports = Scenario;
