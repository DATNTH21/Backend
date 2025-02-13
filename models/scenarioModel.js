const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const getNextSequence = require("../utils/autoIncrementHelper");

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

// ScenarioSchema.pre("save", async function (next) {
//   if (!this.scenario_id) {
//     const session = await mongoose.startSession();
//     try {
//       await session.withTransaction(async () => {
//         this.scenario_id = await getNextSequence("scenarioId", "SC", session);
//       });
//     } finally {
//       session.endSession();
//     }
//   }
//   next();
// });

// Pre-save hook to generate custom scenario_id
ScenarioSchema.pre("save", async function (next) {
  if (!this.scenario_id) {
    const count = await mongoose.model("Scenario").countDocuments();
    this.scenario_id = `SC-${count + 1}`; // Generate custom scenario_id
  }
  next();
});

const Scenario = mongoose.model("Scenario", ScenarioSchema);
module.exports = Scenario;
