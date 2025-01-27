const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestCaseSchema = new Schema(
  {
    test_case_id: { type: String, unique: true, required: true },
    use_case_id: {
      type: Schema.Types.ObjectId,
      ref: "UseCase",
      required: true,
    },
    description: { type: String, required: true },
    pre_conditions: [String],
    steps: [String],
    expected_result: { type: String },
    tags: [String],
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"], // Allowed values
      required: true, // Mark field as required
    },
    status: {
      type: String,
      enum: ["In Progress", "Passed", "Failed"], // Allowed values
      required: true, // Mark field as required
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

const TestCase = mongoose.model("TestCase", TestCaseSchema);
module.exports = TestCase;
