const { ConflictResponse } = require("../response/error");
const userModel = require("../models/userModel");
const accessModel = require("../models/accessModel");
const UserFilter = require("../utils/user.filter");
const MongooseUtil = require("../utils/mongoose.util");
const BcryptHelper = require("../utils/bcrypt.helper");
const {
  generateRandomString,
  generateRSAKeysForAccess,
} = require("../utils/crypto.util");
class UserService {
  constructor() {
    this.userModel = userModel;
    this.accessModel = accessModel;
  }

  async createNewUser({ name, email, password, isVerified, image }) {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictResponse("Email already exists", 1040108);
    }

    const hashedPassword = await BcryptHelper.hash(password);

    const newUser = await this.userModel.create({
      name,
      slug: generateRandomString(10),
      email,
      password: hashedPassword,
      isVerified,
      image,
    });

    const { privateKey, publicKey } = generateRSAKeysForAccess();
    await this.accessModel.create({
      user_id: newUser?._id,
      public_key: publicKey.toString(),
      private_key: privateKey.toString(),
    });

    return newUser;
  }

  async getUserById(userId) {
    const foundUser = await this.userModel
      .findById(MongooseUtil.convertToMongooseObjectIdType(userId))
      .lean();
    if (!foundUser) {
      throw new ConflictResponse("User not found", 1040303);
    }
    return UserFilter.makeDetailFilter({
      ...foundUser,
    });
  }

  async updateUser(userId, { name, password, isVerified, image, slug }) {
    const foundUser = await this.userModel.findById(
      MongooseUtil.convertToMongooseObjectIdType(userId)
    );
    if (!foundUser) {
      throw new ConflictResponse("User not found", 1040408);
    }

    if (name) {
      foundUser.name = name;
    }
    if (password) {
      foundUser.password = await BcryptHelper.hash(password);
    }
    if (isVerified) {
      foundUser.isVerified = isVerified;
    }
    if (image) {
      foundUser.image = image;
    }
    if (slug) {
      foundUser.slug = slug;
    }

    const updatedUser = await foundUser.save();
    return UserFilter.makeDetailFilter(updatedUser._doc);
  }

  async deleteUser(userId) {
    const foundUser = await this.userModel.findById(
      MongooseUtil.convertToMongooseObjectIdType(userId)
    );
    if (!foundUser) {
      throw new ConflictResponse("User not found", 1040503);
    }
    await this.accessModel.deleteOne({
      user_id: MongooseUtil.convertToMongooseObjectIdType(userId),
    });
    return await this.userModel.deleteOne({ _id: foundUser._id });
  }
}

module.exports = UserService;
