const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ScenarioSchema = new Schema(
  {
    scenario_id: { type: String, unique: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    use_case: { type: Schema.Types.ObjectId, ref: "UseCase", required: true },
  },
  { collection: "Scenario" }
);

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
