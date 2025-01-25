const { Mistral } = require("@mistralai/mistralai");
const apiKey = process.env.MISTRAL_API_KEY;

class MistralModel {
  constructor() {
    this.model = new Mistral({ apiKey: apiKey });
  }
  async generateContent(prompt) {
    const result = await this.model.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
    });
    return result.choices[0].message.content;
  }
}

module.exports = new MistralModel();
