const fs = require("fs");
const path = require("path");

const multer = require("multer");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const catchAsync = require("../utils/catchAsync");
const usecasesDir = require("../user-upload/usecases/getDirname");
const descriptionDir = require("../user-upload/description/getDirname");
const pdfToText = require("../utils/pdfToText");
const buildHierarchicalJSONFromText = require("../utils/buildHierarchicalJSONFromText");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const fileManager = new GoogleAIFileManager(process.env.API_KEY);
const mediaPath =
  "https://generativelanguage.googleapis.com/upload/v1beta/files";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "description") cb(null, "user-upload/description");
    if (file.fieldname === "use-cases") cb(null, "user-upload/usecases");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    if (file.fieldname === "use-cases")
      cb(null, `usecase-${Date.now()}.${ext}`);
    if (file.fieldname === "description")
      cb(null, `description-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("application/pdf")) {
    cb(null, true);
  } else {
    cb(new Error("Not an pdf file! Please upload pdf only."), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUsecaseFile = upload.fields([
  { name: "description", maxCount: 1 },
  { name: "use-cases", maxCount: 5 },
]);

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

const makeUsecasesListFromRawData = (data) => {
  const AVERAGE_USE_CASE_LINES = 16;

  const usecasesList = [];
  let node = data,
    usecasesLevel = 0;

  const findAndAddUseCaseToList = (node, currentLevel) => {
    if (currentLevel == usecasesLevel) {
      usecasesList.push(...node);
      return;
    }

    if (Array.isArray(node)) {
      node.forEach((el) =>
        findAndAddUseCaseToList(el.content, currentLevel + 2)
      );
      return;
    }
  };

  while (true) {
    node = Array.isArray(node) ? node?.at(0) : node?.content;

    usecasesLevel++;

    if (Array.isArray(node) && typeof node.at(0) == "string") {
      if (node.length >= AVERAGE_USE_CASE_LINES) {
        usecasesLevel -= 2;
      } else {
        usecasesLevel -= 4;
      }

      node = data;
      findAndAddUseCaseToList(node, 0);
      break;
    }
  }

  return usecasesList;
};

exports.createTestcases = catchAsync(async (req, res, next) => {
  // {
  //   fieldname: 'use-cases',
  //   originalname: 'UseCaseIntroSE.pdf',
  //   encoding: '7bit',
  //   mimetype: 'application/pdf',
  //   destination: 'usecases',
  //   filename: 'usecase-1727958871819.pdf',
  //   path: 'usecases\\usecase-1727958871819.pdf',
  //   size: 864794
  // }

  // DESCRIPTION
  let description;
  for (file of req.files["description"]) {
    const textFilename = file.filename.replace(".pdf", ".txt");
    await pdfToText(
      path.join(descriptionDir, file.filename),
      path.join(descriptionDir, textFilename)
    );
    description = fs.readFileSync(
      path.join(descriptionDir, textFilename),
      "utf8"
    );
  }

  // USE CASES
  let usecasesList = [];
  for (file of req.files["use-cases"]) {
    const textFilename = file.filename.replace(".pdf", ".txt");
    await pdfToText(
      path.join(usecasesDir, file.filename),
      path.join(usecasesDir, textFilename)
    );

    const rawUsecaseData = buildHierarchicalJSONFromText(
      path.join(usecasesDir, textFilename)
    );
    usecasesList.push(...makeUsecasesListFromRawData(rawUsecaseData));
  }

  let testcases = [];
  for (usecase of usecasesList.slice(0, 5)) {
    const result = await model.generateContent(
      `Generate 2 test case based on the project's description and the provided usecase. Output JSON object including following field: (test_case_id,test_case_description,pre-conditions,steps,expected_result). 
      - Description: ${description}
      - Use case: ${JSON.stringify(usecase)}`
    );
    console.log(extractJSON(result.response.text()));
    testcases.push(JSON.parse(extractJSON(result.response.text())));
  }

  res.status(200).json({
    status: "success",
    data: {
      testcases,
    },
  });
});
