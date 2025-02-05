const UseCase = require("../models/usecaseModel");
const Project = require("../models/projectModel");
const sendResponse = require("./responseController");

// Create list of use cases
exports.createUseCases = async (req, res) => {
  try {
    // Save the project
    const { project_id, content } = req.body;
    const useCasesList = [];
    for (const useCase of content) {
      const newUseCase = new UseCase({
        project_id,
        description: useCase,
      });
      await newUseCase.save();
      useCasesList.push(newUseCase);
    }

    return sendResponse(
      res,
      200,
      "Create use cases successfully",
      useCasesList
    );
  } catch (error) {
    return sendResponse(
      res,
      500,
      "Failed to create use cases",
      undefined,
      error.message
    );
  }
};

exports.getAllUseCases = async (req, res) => {
  try {
    // Save the project
    const { project_id } = req.query;

    // console.log("req.user._id", req.user);

    const project = await Project.findOne({
      _id: project_id,
    });

    if (!project || project.user.toString() !== req.user.id) {
      return sendResponse(
        res,
        404,
        "Project not found or not owned by you",
        undefined
      );
    }
    const useCasesList = await UseCase.find({ project_id });

    return sendResponse(
      res,
      200,
      "Get all use cases successfully",
      useCasesList
    );
  } catch (error) {
    return sendResponse(
      res,
      500,
      "Failed to get all use cases",
      undefined,
      error.message
    );
  }
};
