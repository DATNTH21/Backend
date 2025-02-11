const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestCaseSchema = new Schema(
  {
    test_case_id: { type: String, unique: true },
    use_case: {
      type: mongoose.Schema.ObjectId,
      ref: "UseCase",
      required: true,
    },
    scenario: {
      type: mongoose.Schema.ObjectId,
      ref: "Scenario",
      required: true,
    },
    project: {
      type: mongoose.Schema.ObjectId,
      ref: "Project",
      required: true,
    },
    name: { type: String, required: true },
    objective: { type: String, required: true },
    pre_condition: { type: String },
    steps: [String],
    expected_result: { type: String },
    priority: {
      type: String,
    },
    status: {
      type: String,
    },
    tester: {
      type: String,
    },
    test_date: {
      type: String,
    },
    remarks: {
      type: String,
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "TestCase" }
);

// Pre-save hook to generate custom test_case_id
TestCaseSchema.pre("save", async function (next) {
  if (!this.test_case_id) {
    const count = await mongoose.model("TestCase").countDocuments();
    this.test_case_id = `TC-${count + 1}`; // Generate custom test_case_id
  }
  next();
});

TestCaseSchema.post("save", async function () {
  const Scenario = mongoose.model("Scenario");
  await Scenario.findByIdAndUpdate(this.scenario, {
    $inc: { test_cases_count: 1 },
  });
});

TestCaseSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const Scenario = mongoose.model("Scenario");
    await Scenario.findByIdAndUpdate(doc.scenario, {
      $inc: { test_cases_count: -1 },
    });
  }
});

const TestCase = mongoose.model("TestCase", TestCaseSchema);
module.exports = TestCase;
