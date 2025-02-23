const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const getNextSequence = require("../utils/autoIncrementHelper");

const UseCaseSchema = new Schema(
  {
    use_case_id: { type: String, unique: true, required: true },
    project_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Project",
      required: true,
    }, // Refers to the associated project
    name: { type: String },
    description: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "UseCase" }
);

// Pre-save hook to generate custom use_case_id
UseCaseSchema.pre("save", async function (next) {
  if (!this.use_case_id) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        this.use_case_id = await getNextSequence("useCaseId", "UC", session);
      });
    } finally {
      session.endSession();
    }
  }
  next();
});

const UseCase = mongoose.model("UseCase", UseCaseSchema);
module.exports = UseCase;
