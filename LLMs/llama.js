const GroqFamily = require("./groq-family");

class Llama extends GroqFamily {
  constructor() {
    super("llama-3.2-90b-vision-preview");
  }
  generateContent = async (prompt) => {
    const result = await super.generateContent(
      `${prompt}\n\n The output must only be a JSON object. Do not provide any redundant information or code snippets.`
    );

    return result;
  };
}

module.exports = new Llama();
