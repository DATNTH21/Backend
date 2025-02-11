const UserConfig = require("../models/userConfigModel");
const sendResponse = require("./responseController");

exports.getUserConfig = async (req, res) => {
  try {
    const template = await UserConfig.findOne({
      userId: req.user.id,
    });
    //console.log("User Export Template: ", template);
    if (!template) {
      return sendResponse(
        res,
        404,
        "Test case export template not found",
        undefined,
        "Template not found"
      );
    }
    return sendResponse(
      res,
      200,
      "Get test case export template successfully",
      template
    );
  } catch (error) {
    return sendResponse(
      res,
      500,
      "Error getting test case export template",
      undefined,
      error.message
    );
  }
};

exports.addUserConfigOption = async (req, res) => {
  try {
    const { type, name } = req.body;
    // Validate the 'type' parameter
    if (!["priority", "status"].includes(type)) {
      return sendResponse(
        res,
        404,
        "Type must be 'priority' or 'status'",
        undefined,
        "Type must be 'priority' or 'status'"
      );
    }

    if (!name) {
      return sendResponse(
        res,
        404,
        "Name must be provided",
        undefined,
        "Name must be provided"
      );
    }

    const userConfig = await UserConfig.findOne({ userId: req.user.id });

    if (!userConfig) {
      return sendResponse(res, 404, "User config not found");
    }

    // Prevent changes to default values
    const defaultValues = {
      priority: [
        { name: "Low", icon: "ChevronDown" },
        { name: "Medium", icon: "Minus" },
        { name: "High", icon: "ChevronUp" },
        { name: "Critical", icon: "ChevronsUp" },
      ],
      status: [
        { name: "In Progress", icon: "Timer" },
        { name: "Pass", icon: "CheckCircle" },
        { name: "Fail", icon: "CircleOff" },
      ],
    };

    // If the option already exists, do nothing
    if (userConfig[type].some((option) => option.name === name)) {
      return sendResponse(
        res,
        400,
        "Option already exists",
        undefined,
        `${type} option '${name}' already exists`
      );
    }

    // Prevent adding default values again
    if (
      defaultValues[type].some((defaultOption) => defaultOption.name === name)
    ) {
      return sendResponse(
        res,
        400,
        "Cannot add default option",
        undefined,
        `${type} option '${name}' is a default value and cannot be added`
      );
    }

    // Add new option
    userConfig[type].push({ name });
    await userConfig.save();

    return sendResponse(
      res,
      200,
      `Added new ${type} option successfully`,
      userConfig[type]
    );
  } catch (error) {
    return sendResponse(
      res,
      500,
      "Error adding config option",
      undefined,
      error.message
    );
  }
};

exports.deleteUserConfigOption = async (req, res) => {
  try {
    const { type, name } = req.body;

    // Validate the 'type' parameter
    if (!["priority", "status"].includes(type)) {
      return sendResponse(
        res,
        404,
        "Type must be 'priority' or 'status'",
        undefined,
        "Type must be 'priority' or 'status'"
      );
    }

    if (!name) {
      return sendResponse(
        res,
        404,
        "Name must be provided",
        undefined,
        "Name must be provided"
      );
    }

    const userConfig = await UserConfig.findOne({ userId: req.user.id });

    if (!userConfig) {
      return sendResponse(res, 404, "User config not found");
    }

    // Prevent deletion of default values
    const defaultValues = {
      priority: [
        { name: "Low", icon: "ChevronDown" },
        { name: "Medium", icon: "Minus" },
        { name: "High", icon: "ChevronUp" },
        { name: "Critical", icon: "ChevronsUp" },
      ],
      status: [
        { name: "In Progress", icon: "Timer" },
        { name: "Pass", icon: "CheckCircle" },
        { name: "Fail", icon: "CircleOff" },
      ],
    };

    // Check if the option is a default value
    const isDefault = defaultValues[type].some(
      (defaultOption) => defaultOption.name === name
    );

    if (isDefault) {
      return sendResponse(
        res,
        400,
        "Cannot delete default option",
        undefined,
        `${type} option '${name}' is a default value and cannot be deleted`
      );
    }

    // Find and remove the option from the respective array
    const optionIndex = userConfig[type].findIndex(
      (option) => option.name === name
    );

    if (optionIndex === -1) {
      return sendResponse(
        res,
        404,
        `${type} option '${name}' not found`,
        undefined,
        `${type} option '${name}' not found`
      );
    }

    // Remove the option from the array
    userConfig[type].splice(optionIndex, 1);
    await userConfig.save();

    return sendResponse(
      res,
      200,
      `${type} option '${name}' deleted successfully`,
      userConfig[type]
    );
  } catch (error) {
    return sendResponse(
      res,
      500,
      "Error deleting config option",
      undefined,
      error.message
    );
  }
};

exports.updateTestCaseExportTemplate = async (req, res) => {
  try {
    const { template } = req.body;

    if (!template) {
      return sendResponse(
        res,
        404,
        "Test case export template column not found",
        undefined,
        "Test case export template column not found"
      );
    }

    if (!Array.isArray(template) || template.length === 0) {
      return sendResponse(
        res,
        400,
        "Invalid template data",
        undefined,
        "Columns must be a non-empty array"
      );
    }

    const allowedFieldKeys = [
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
    ];

    const fieldKeySet = new Set();
    const orderSet = new Set();

    for (const column of template) {
      const { fieldKey, displayName, order, visible } = column;

      // Ensure all required fields are present
      if (
        !fieldKey ||
        !displayName ||
        order === undefined ||
        visible === undefined
      ) {
        return sendResponse(
          res,
          400,
          `Invalid column format for fieldKey: ${fieldKey}`,
          undefined,
          "Missing required fields"
        );
      }

      // Check if fieldKey is valid
      if (!allowedFieldKeys.includes(fieldKey)) {
        return sendResponse(
          res,
          400,
          `Invalid fieldKey: ${fieldKey}`,
          undefined,
          "Invalid fieldKey provided"
        );
      }

      // Ensure fieldKey is unique
      if (fieldKeySet.has(fieldKey)) {
        return sendResponse(
          res,
          400,
          `Duplicate fieldKey detected: ${fieldKey}`,
          undefined,
          "Duplicate fieldKey found"
        );
      }
      fieldKeySet.add(fieldKey);

      // Ensure order is unique and positive
      if (orderSet.has(order)) {
        return sendResponse(
          res,
          400,
          `Duplicate order value detected: ${order}`,
          undefined,
          "Duplicate order found"
        );
      }
      if (order < 0 || !Number.isInteger(order)) {
        return sendResponse(
          res,
          400,
          `Invalid order value: ${order}`,
          undefined,
          "Order must be a non-negative integer"
        );
      }
      orderSet.add(order);
    }

    const updatedTemplate = await UserConfig.findOneAndUpdate(
      { userId: req.user.id },
      { testCaseExportTemplate: template },
      { new: true, upsert: true }
    );

    if (!updatedTemplate) {
      return sendResponse(
        res,
        404,
        "Test case export template not found",
        undefined,
        "Template not found"
      );
    }

    console.log("Updated export template: ", template);
    return sendResponse(
      res,
      200,
      "Update test case export template successfully",
      updatedTemplate
    );
  } catch (error) {
    return sendResponse(
      res,
      500,
      "Error getting test case export template",
      undefined,
      error.message
    );
  }
};
