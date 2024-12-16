const Project = require("../models/projectModel"); // Import the Project model
const UseCase = require("../models/usecaseModel"); // Import the UseCase model
const User = require("../models/userModel"); // Import the User model
const Project = require("../models/projectModel"); // Import the Project model
const UseCase = require("../models/usecaseModel"); // Import the UseCase model
const User = require("../models/userModel"); // Import the User model
const sendResponse = require("./responseController");

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
    return sendResponse(res, 200, "Create project successfully", savedProject);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating project", error: error.message });
    return sendResponse(
      res,
      500,
      "Failed to create project",
      undefined,
      error.message
    );
  }
};

// Get all projects for a specific user
exports.getProjectsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { search } = req.query;
    const query = { users: userId };

    if (search) {
      query.name = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    // Get all projects associated with the user
    const projects = await Project.find({ users: userId }).populate(
      "use_cases"
    );
    const projects = await Project.find(query).populate("use_cases");

    if (projects.length === 0) {
      return sendResponse(
        res,
        200,
        "No projects found for this user",
        [],
        "No projects found for this user"
      );
    }

    return sendResponse(
      res,
      200,
      "Get projects by user successfully",
      projects
    );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving projects", error: error.message });
    return sendResponse(
      res,
      500,
      "Error getting projects by user",
      undefined,
      error.message
    );
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
    const project = await Project.findOne({ _id: projectId })
      .populate("use_cases")
      .populate("users"); // Populate the use_cases and users

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
      return sendResponse(
        res,
        404,
        "Project not found",
        undefined,
        "Project not found"
      );
    }

    return sendResponse(res, 200, "Get project by id successfully", project);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving project", error: error.message });
    return sendResponse(
      res,
      500,
      "Error getting project by id",
      undefined,
      error.message
    );
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
      return sendResponse(
        res,
        404,
        "Project not found",
        undefined,
        "Project not found"
      );
    }

    return sendResponse(
      res,
      200,
      "Project updated successfully",
      updatedProject
    );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating project", error: error.message });
    return sendResponse(
      res,
      500,
      "Error updating project",
      undefined,
      error.message
    );
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
      return sendResponse(
        res,
        404,
        "Project not found",
        undefined,
        "Project not found"
      );
    }

    res.status(200).json({ message: "Project deleted successfully" });
    return sendResponse(res, 200, "Project deleted successfully");
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting project", error: error.message });
    return sendResponse(
      res,
      500,
      "Error deleting project",
      undefined,
      error.message
    );
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
      return sendResponse(
        res,
        404,
        "Project or usecase not found",
        undefined,
        "Project or usecase not found"
      );
    }

    // Add the use case to the project
    project.use_cases.push(useCase._id);
    await project.save();

    res.status(200).json({ message: "UseCase added to project", project });
    return sendResponse(res, 200, "Usecase added to project successfully");
  } catch (error) {
    return sendResponse(
      res,
      500,
      "Error adding use case to project",
      undefined,
      error.message
    );
  }
};
