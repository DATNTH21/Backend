// public/utils.js
const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Google Generative AI configuration
const configuration = new GoogleGenerativeAI(process.env.API_KEY);
const modelId = "text-embedding-004";

// Define safety settings for content generation
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const generativeModel = configuration.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });

export async function generateResponse(query) {
  const result = await generativeModel.generateContent(`Question: ${query}`);
  return result.response.text();
}

module.exports = { generateResponse };
