const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    use_cases: [{ type: Schema.Types.ObjectId, ref: "UseCase" }],
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { collection: "Project" }
);

// Pre-save hook to generate custom project_id
ProjectSchema.pre("save", async function (next) {
  if (!this.project_id) {
    // Find the highest project number
    const highestProject = await mongoose
      .model("Project")
      .findOne({}, { project_id: 1 })
      .sort({ project_id: -1 });

    let nextNumber = 1;
    if (highestProject && highestProject.project_id) {
      // Extract number from PR-X format and add 1
      const currentNumber = parseInt(highestProject.project_id.split("-")[1]);
      nextNumber = currentNumber + 1;
    }

    this.project_id = `PR-${nextNumber}`;
  }
  next();
});

const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;
