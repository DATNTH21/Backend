const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  project_id: { type: String, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["Generating", "Done", "Seen"], // Allowed values
    required: true,
    default: "Generating", // Default value
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  use_cases: [{ type: Schema.Types.ObjectId, ref: 'UseCase' }],
  users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true}]
});

// Pre-save hook to generate custom project_id
ProjectSchema.pre('save', async function (next) {
  if (!this.project_id) {
    const count = await mongoose.model('Project').countDocuments();
    this.project_id = `PR-${count + 1}`; // Generate custom project_id
  }
  next();
});

const Project = mongoose.model('Project', ProjectSchema);
module.exports = Project;
