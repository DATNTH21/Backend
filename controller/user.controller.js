const { BadRequestResponse } = require("../response/error");
const { OKSuccessResponse } = require("../response/success");
const MongooseUtil = require("../utils/mongoose.util");
const UserService = require("../services/user.service");
const UserValidator = require("../validators/user.validator");
const UserConfig = require("../models/userConfig");

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  createNewUser = async (req, res, next) => {
    const validationResult = UserValidator.validateCreateNewUser(req);
    if (validationResult?.error === true) {
      throw new BadRequestResponse(
        validationResult?.message ?? "",
        validationResult?.code ?? -1
      );
    }

    const { name, email, password, isVerified, image } = validationResult?.data;
    try {
      const result = await this.userService.createNewUser({
        name,
        email,
        password,
        isVerified,
        image,
      });

      // Create user config when create user
      const newUserConfig = UserConfig.create({
        userId: result._id,
      });

      console.log("Initial User Config when creating user: ", newUserConfig);
      return new OKSuccessResponse({
        message: "Create new user success",
        data: result,
        code: 1040100,
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1040110);
      }
      throw error;
    }
  };

  getUserById = async (req, res, next) => {
    const validationResult = UserValidator.validateGetUserById(req);
    if (validationResult?.error === true) {
      throw new BadRequestResponse(
        validationResult?.message ?? "",
        validationResult?.code ?? -1
      );
    }

    const { userId } = validationResult?.data;
    try {
      const result = await this.userService.getUserById(userId);
      return new OKSuccessResponse({
        message: "Get user by ID success",
        data: result,
        code: 1040300,
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1040305);
      }
      throw error;
    }
  };

  updateUser = async (req, res, next) => {
    const validationResult = UserValidator.validateUpdateUser(req);
    if (validationResult?.error === true) {
      throw new BadRequestResponse(
        validationResult?.message ?? "",
        validationResult?.code ?? -1
      );
    }

    const { userId, name, password, isVerified, image, slug } =
      validationResult?.data;
    try {
      const result = await this.userService.updateUser(userId, {
        userId,
        name,
        password,
        isVerified,
        image,
        slug,
      });
      return new OKSuccessResponse({
        message: "Update user success",
        data: result,
        code: 1040400,
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1040410);
      }
      throw error;
    }
  };

  deleteUser = async (req, res, next) => {
    const validationResult = UserValidator.validateDeleteUser(req);
    if (validationResult?.error === true) {
      throw new BadRequestResponse(
        validationResult?.message ?? "",
        validationResult?.code ?? -1
      );
    }

    const { userId } = validationResult?.data;
    try {
      const result = await this.userService.deleteUser(userId);
      return new OKSuccessResponse({
        message: "Delete user success",
        data: {
          deleted: userId,
        },
        code: 1040500,
        metadata: {
          ...result,
        },
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1040504);
      }
      throw error;
    }
  };
}

module.exports = new UserController();
