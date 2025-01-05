const GroqFamily = require("./groq-family");

class Mistral extends GroqFamily {
  constructor() {
    super("mixtral-8x7b-32768");
  }
  // generateContent = async (prompt) => {
  //   const result = await super.generateContent(
  //     `${prompt}\n\n The output must only be a JSON object. Do not provide any redundant information or code snippets.`
  //   );

  //   return result;
  // };
}

module.exports = new Mistral();
