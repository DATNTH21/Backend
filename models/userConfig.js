const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConfigOptionSchema = new Schema({
  name: { type: String, required: true }, // e.g., "High", "Low"
  icon: { type: String, default: "default-icon" }, // e.g., "arrow-up", "alert-circle"
});

// TestCaseExportTemplate column schema
const TestCaseExportColumnSchema = new Schema({
  fieldKey: {
    type: String,
    required: true,
    enum: [
      "test_case_id",
      "use_case_id",
      "description",
      "pre_condition",
      "steps",
      "expected_result",
      "priority",
      "status",
      "test_date",
      "tester",
      "remarks",
    ],
  },
  displayName: { type: String, required: true },
  order: { type: Number, required: true },
  visible: { type: Boolean, required: true },
});

const UserConfigSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },
    priority: [ConfigOptionSchema],
    status: [ConfigOptionSchema],
    testCaseExportTemplate: [TestCaseExportColumnSchema],
  },
  { collection: "UserConfig" }
);
UserConfigSchema.pre("save", function (next) {
  if (!this.priority || this.priority.length === 0) {
    this.priority = [
      { name: "Low", icon: "arrow-down" },
      { name: "Medium", icon: "minus" },
      { name: "High", icon: "arrow-up" },
    ];
  }

  if (!this.status || this.status.length === 0) {
    this.status = [
      { name: "In Progress", icon: "clock" },
      { name: "Passed", icon: "check-circle" },
      { name: "Failed", icon: "x-circle" },
    ];
  }

  if (
    !this.testCaseExportTemplate ||
    this.testCaseExportTemplate.length === 0
  ) {
    this.testCaseExportTemplate = [
      {
        fieldKey: "test_case_id",
        displayName: "Test Case ID",
        order: 0,
        visible: true,
      },
      {
        fieldKey: "use_case_id",
        displayName: "Use Case ID",
        order: 1,
        visible: true,
      },
      {
        fieldKey: "description",
        displayName: "Description",
        order: 2,
        visible: true,
      },
      {
        fieldKey: "pre_condition",
        displayName: "Pre Condition",
        order: 3,
        visible: false,
      },
      { fieldKey: "steps", displayName: "Steps", order: 4, visible: true },
      {
        fieldKey: "expected_result",
        displayName: "Expected Result",
        order: 5,
        visible: true,
      },
      {
        fieldKey: "priority",
        displayName: "Priority",
        order: 6,
        visible: true,
      },
      { fieldKey: "status", displayName: "Status", order: 7, visible: true },
      {
        fieldKey: "test_date",
        displayName: "Test Date",
        order: 8,
        visible: false,
      },
      {
        fieldKey: "tester",
        displayName: "Tester",
        order: 9,
        visible: false,
      },
      {
        fieldKey: "remarks",
        displayName: "Remarks",
        order: 10,
        visible: false,
      },
    ];
  }

  next();
});

const UserConfig = mongoose.model("UserConfig", UserConfigSchema);
module.exports = UserConfig;
