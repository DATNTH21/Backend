const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConfigOptionSchema = new Schema({
  name: { type: String, required: true },
  icon: { type: String, default: "CircleDot" },
});

// TestCaseExportTemplate column schema
const TestCaseExportColumnSchema = new Schema({
  fieldKey: {
    type: String,
    required: true,
    enum: [
      "test_case_id",
      "use_case",
      "name",
      "objective",
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
      { name: "Low", icon: "ChevronDown" },
      { name: "Medium", icon: "Minus" },
      { name: "High", icon: "ChevronUp" },
      { name: "Critical", icon: "ChevronsUp" },
    ];
  }

  if (!this.status || this.status.length === 0) {
    this.status = [
      { name: "In Progress", icon: "Timer" },
      { name: "Pass", icon: "CheckCircle" },
      { name: "Fail", icon: "CircleOff" },
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
        fieldKey: "use_case",
        displayName: "Use Case",
        order: 1,
        visible: true,
      },
      {
        fieldKey: "name",
        displayName: "Name",
        order: 2,
        visible: true,
      },
      {
        fieldKey: "objective",
        displayName: "Objective",
        order: 3,
        visible: true,
      },
      {
        fieldKey: "pre_condition",
        displayName: "Pre Condition",
        order: 4,
        visible: false,
      },
      { fieldKey: "steps", displayName: "Steps", order: 5, visible: true },
      {
        fieldKey: "expected_result",
        displayName: "Expected Result",
        order: 6,
        visible: true,
      },
      {
        fieldKey: "priority",
        displayName: "Priority",
        order: 7,
        visible: true,
      },
      { fieldKey: "status", displayName: "Status", order: 8, visible: true },
      {
        fieldKey: "test_date",
        displayName: "Test Date",
        order: 9,
        visible: false,
      },
      {
        fieldKey: "tester",
        displayName: "Tester",
        order: 10,
        visible: false,
      },
      {
        fieldKey: "remarks",
        displayName: "Remarks",
        order: 11,
        visible: false,
      },
    ];
  }

  next();
});

const UserConfig = mongoose.model("UserConfig", UserConfigSchema);
module.exports = UserConfig;
