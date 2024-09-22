const multer = require("multer");
const { pathToFileURL } = require("node:url");

const sharp = require("sharp");
const catchAsync = require("../utils/catchAsync");
const usecasesDir = require("../usecases/getDirname");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});
const fileManager = new GoogleAIFileManager(process.env.API_KEY);
const mediaPath =
  "https://generativelanguage.googleapis.com/upload/v1beta/files";

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUsecasePhoto = upload.single("photo");

exports.setUpPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `usecase-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .toFormat("jpeg")
    .toFile(`usecases/${req.file.filename}`);

  req.file.path = `${usecasesDir}\\${req.file.filename}`;
  req.file.uri = pathToFileURL(req.file.path);
  next();
});

const extractJSON = (str) => {
  const regex = /```json\s*([\s\S]*?)\s*```/;
  const match = str.match(regex);
  // Check if a match is found and extract the JSON
  if (match && match[1]) {
    const realJSON = match[1].trim();
    return realJSON;
  }
  return "";
};

exports.createTestcases = catchAsync(async (req, res, next) => {
  const uploadResult = await fileManager.uploadFile(req.file.path, {
    mimeType: "image/jpeg",
    displayName: "use-case",
  });

  const { description } = req.body;

  const result = await model.generateContent([
    `Generate 5 test case based on the project's description and the provided usecase image. Output JSON object including following field: (test_case_id,test_case_description,pre-conditions,steps,expected_result). Description: ${description}`,
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
      },
    },
  ]);

  const test_cases = JSON.parse(extractJSON(result.response.text()));

  res.status(200).json({
    status: "success",
    data: {
      test_cases,
    },
  });
});
