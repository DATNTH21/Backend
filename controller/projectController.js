const Project = require("../models/projectModel"); // Import the Project model
const UseCase = require("../models/usecaseModel"); // Import the UseCase model
const User = require("../models/userModel"); // Import the User model

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, status, users } = req.body;

    // Create a new project
    const newProject = new Project({
      name,
      description,
      status,
      users, // Array of user IDs associated with this project
    });

    // Save the project
    const savedProject = await newProject.save();

    res
      .status(201)
      .json({ message: "Project created successfully", project: savedProject });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating project", error: error.message });
  }
};

// Get all projects for a specific user
exports.getProjectsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get all projects associated with the user
    const projects = await Project.find({ users: userId }).populate(
      "use_cases"
    );

    if (projects.length === 0) {
      return res
        .status(404)
        .json({ message: "No projects found for this user" });
    }

    res.status(200).json({ projects });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving projects", error: error.message });
  }
};

// Get a specific project by its project_id
exports.getProjectById = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Find the project by its project_id
    const project = await Project.findOne({ project_id: projectId })
      .populate("use_cases")
      .populate("users"); // Populate the use_cases and users

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ project });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving project", error: error.message });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { name, description, status, users } = req.body;

    // Find the project and update it
    const updatedProject = await Project.findOneAndUpdate(
      { project_id: projectId },
      { name, description, status, users, updated_at: Date.now() },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res
      .status(200)
      .json({
        message: "Project updated successfully",
        project: updatedProject,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating project", error: error.message });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Delete the project
    const deletedProject = await Project.findOneAndDelete({
      project_id: projectId,
    });

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting project", error: error.message });
  }
};

// Add use case to project
exports.addUseCaseToProject = async (req, res) => {
  try {
    const { projectId, useCaseId } = req.body;

    // Find the project and add the use case
    const project = await Project.findOne({ project_id: projectId });
    const useCase = await UseCase.findOne({ use_case_id: useCaseId });

    if (!project || !useCase) {
      return res.status(404).json({ message: "Project or UseCase not found" });
    }

    // Add the use case to the project
    project.use_cases.push(useCase._id);
    await project.save();

    res.status(200).json({ message: "UseCase added to project", project });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error adding use case to project",
        error: error.message,
      });
  }
};
