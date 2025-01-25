const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

class GroqFamily {
  constructor(modelName) {
    this.model = groq.chat.completions;
    this.modelName = modelName;
  }
  async generateContent(prompt) {
    const result = await this.model.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: this.modelName,
    });
    return result.choices[0]?.message?.content;
  }
}

module.exports = GroqFamily;
