const ValidatorConfig = require("../config/validator.config");
const validator = require("validator");

class UserValidator extends ValidatorConfig {
  static getUserAttributes() {
    return [
      "slug",
      "email",
      "password",
      "name",
      "image",
      "isVerified",
      "type_login",
      "google_id",
    ];
  }

  static validateCreateNewUser(req) {
    const body = req.body;
    // Email validation
    if (validator.isEmpty(body.email ?? "")) {
      return UserValidator.returnFailedError("Email is required", 1040101);
    } else if (!validator.isEmail(body.email)) {
      return UserValidator.returnFailedError("Email is invalid", 1040102);
    }

    // Password validation
    if (validator.isEmpty(body.password ?? "")) {
      return UserValidator.returnFailedError("Password is required", 1040103);
    } else if (!validator.isLength(body.password, { min: 3 })) {
      return UserValidator.returnFailedError(
        "Password must be at least 3 characters long",
        1040104
      );
    }

    // Email verification validation
    let emailVerified = body.isVerified;
    if (validator.isEmpty(emailVerified ?? "")) {
      emailVerified = false;
    } else if (!validator.isBoolean(body.email_verified)) {
      return UserValidator.returnFailedError(
        "Email verification must be a boolean",
        1040107
      );
    }

    // Validation passed
    return UserValidator.returnPassedData({
      email: body.email,
      password: body.password,
      isVerified: emailVerified,
      name: body.name ?? "",
      image: body.image ?? "",
    });
  }

  static validateGetUserById(req) {
    const userId = req.params?.id;
    if (!userId) {
      return UserValidator.returnFailedError("User ID is required", 1040301);
    } else if (!validator.isMongoId(userId)) {
      return UserValidator.returnFailedError("User ID is invalid", 1040302);
    }

    // Validation passed
    return UserValidator.returnPassedData({
      userId: userId,
    });
  }

  static validateUpdateUser(req) {
    const userId = req.params?.id;
    if (!userId) {
      return UserValidator.returnFailedError("User ID is required", 1040401);
    } else if (!validator.isMongoId(userId)) {
      return UserValidator.returnFailedError("User ID is invalid", 1040402);
    }

    // Attribute validation
    const attributes = UserValidator.getUserAttributes();
    const hasAttribute = attributes.some((attribute) => req.body[attribute]);
    if (!hasAttribute) {
      return UserValidator.returnFailedError(
        "No data given to update",
        1040403
      );
    }

    const body = req.body;
    // Email validation
    if (body.email) {
      return UserValidator.returnFailedError("Email is irreplaceable", 1040404);
    }

    // Password validation
    if (body.password && !validator.isLength(body.password, { min: 3 })) {
      return UserValidator.returnFailedError(
        "Password must be at least 3 characters long",
        1040405
      );
    }

    // Email verification validation
    if (body.isVerified && !validator.isBoolean(body.isVerified)) {
      return UserValidator.returnFailedError(
        "Email verification must be a boolean",
        1040407
      );
    }

    // Validation passed
    return UserValidator.returnPassedData({
      userId: userId,
      password: body.password ?? undefined,
      isVerified: body.isVerified ?? undefined,
      name: body.name ?? undefined,
      image: body.image ?? undefined,
      slug: body.slug ?? undefined,
    });
  }

  static validateDeleteUser(req) {
    const userId = req.params?.id;
    if (!userId) {
      return UserValidator.returnFailedError("User ID is required", 1040501);
    } else if (!validator.isMongoId(userId)) {
      return UserValidator.returnFailedError("User ID is invalid", 1040502);
    }

    // Validation passed
    return UserValidator.returnPassedData({
      userId: userId,
    });
  }
}

module.exports = UserValidator;
