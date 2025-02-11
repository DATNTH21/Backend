const { name } = require("ejs");
const Project = require("../models/projectModel"); // Import the Project model
const Scenario = require("../models/scenarioModel");
const TestCase = require("../models/testcaseModel");
const UseCase = require("../models/usecaseModel"); // Import the UseCase model
const User = require("../models/userModel"); // Import the User model
const sendResponse = require("./responseController");

// Create a new project
exports.createProject = async (req, res) => {
  try {
    //console.log(req.user);
    const { name, description } = req.body;

    //Validate project name here

    // Create a new project
    const newProject = new Project({
      name,
      description,
      user: req.user.id, // Array of user IDs associated with this project
    });

    console.log("Project controller: ", newProject);

    // Save the project
    const savedProject = await newProject.save();

    return sendResponse(res, 200, "Create project successfully", savedProject);
  } catch (error) {
    console.log(error);
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
    //const userId = req.params.userId;
    const userId = req.user.id;
    const { search } = req.query;
    const query = { user: userId };

    if (search) {
      query.name = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    // Get all projects associated with the user
    const projects = await Project.find(query)
      .populate({
        path: "use_cases",
        select: "-__v",
      })
      .populate({
        path: "test_cases",
        select: "-__v",
      });
    console.log("query: ", query);
    console.log("Projects: ", projects);

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
    const project = await Project.findOne({ _id: projectId })
      .populate("use_cases")
      .populate("user"); // Populate the use_cases and users

    if (!project) {
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
    const { name, description, status } = req.body;

    // Find the project and update it
    const updatedProject = await Project.findOneAndUpdate(
      { project_id: projectId },
      { name, description, status, updated_at: Date.now() },
      { new: true }
    );

    if (!updatedProject) {
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
      _id: projectId,
    });

    if (!deletedProject) {
      return sendResponse(
        res,
        404,
        "Project not found",
        undefined,
        "Project not found"
      );
    }

    return sendResponse(res, 200, "Project deleted successfully");
  } catch (error) {
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

exports.getProjectStats = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return sendResponse(res, 404, "Project not found", null);
    }

    const totalTestCases = await TestCase.countDocuments({
      project: project._id,
    });

    const useCases = await UseCase.find({ project_id: project._id });
    const useCaseIds = useCases.map((uc) => uc._id);
    const totalScenarios = await Scenario.countDocuments({
      use_case: { $in: useCaseIds },
    });

    const statusCounts = await TestCase.aggregate([
      {
        $match: {
          project: project._id,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);

    const statistics = {
      total_test_cases: totalTestCases,
      total_scenarios: totalScenarios,
      test_cases_by_status: statusCounts,
    };

    return sendResponse(
      res,
      200,
      "Statistics retrieved successfully",
      statistics
    );
  } catch (error) {
    console.error("Error getting project statistics:", error);
    return sendResponse(
      res,
      500,
      "Error retrieving project statistics",
      null,
      error.message
    );
  }
};
