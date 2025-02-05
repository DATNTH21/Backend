const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UseCaseSchema = new Schema(
  {
    use_case_id: { type: String, unique: true },
    project_id: { type: Schema.Types.ObjectId, ref: "Project", required: true }, // Refers to the associated project
    description: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "UseCase" }
);

// Pre-save hook to generate custom use_case_id
UseCaseSchema.pre("save", async function (next) {
  if (!this.use_case_id) {
    const count = await mongoose.model("UseCase").countDocuments();
    this.use_case_id = `UC-${count + 1}`; // Generate custom use_case_id
  }
  next();
});

const UseCase = mongoose.model("UseCase", UseCaseSchema);
module.exports = UseCase;
