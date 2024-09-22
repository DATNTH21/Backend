const fs = require("fs");
const {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} = require("@google/generative-ai");
const dotenv = require("dotenv");
const { client, createTable } = require('./db/dbClient.js');
const {generateResponse} = require('./utils/generateResponse.js')

dotenv.config();

// Google Generative AI configuration
const configuration = new GoogleGenerativeAI(process.env.API_KEY);
const modelId = "text-embedding-004";

// Define safety settings for content generation
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const model = configuration.getGenerativeModel({
  model: modelId,
  safetySettings,
});

const generativeModel = configuration.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySettings,
});

async function run() {
  const context = JSON.parse(fs.readFileSync('./repository_trees/CanteenBECode_folder_tree.json', 'utf8'));
  const query = `Please provide the order for creating unit tests for each file in the project with the following directory tree: ${JSON.stringify(context)} without explain`; 
  const generatedResponse = await generateResponse(query);
  await client.end();
  console.log("Generated Response:", generatedResponse);
}

run();