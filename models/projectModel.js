const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const getNextSequence = require("../utils/autoIncrementHelper");

const ProjectSchema = new Schema(
  {
    project_id: { type: String, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["Generating", "Done", "Seen", "Failed", "Default"],
      required: true,
      default: "Default",
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  },
  {
    collection: "Project",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProjectSchema.virtual("test_cases", {
  ref: "TestCase",
  foreignField: "project",
  localField: "_id",
});

ProjectSchema.virtual("use_cases", {
  ref: "UseCase",
  foreignField: "project_id",
  localField: "_id",
});

ProjectSchema.pre("save", async function (next) {
  if (!this.project_id) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      this.project_id = await getNextSequence("projectId", "PR", session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error("Error getting next sequence:", error);
    } finally {
      session.endSession();
    }
  }
  next();
});

const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;
