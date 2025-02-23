const model = require("../LLMs/gemini");
const retryAsync = require("../utils/retryAsync");

class UseCaseNameGenerator {
  constructor(model) {
    this.model = model;
  }

  generateTextResult = retryAsync(async (prompt) => {
    const result = await this.model.generateContent(prompt);
    return result;
  });

  async generate(useCaseSpec) {
    const prompt = `The following is a Usecase Summary agent that is designed to summarize a use case specification in less than 100 characters. The use case specification can have different format.\n\n 
    Example:\n
    - Use case specification:\n
    \`\`\`text\n
  4.2 Hotel Owner - Update Hotel Information
  4.2.1 Summary:Hotel Owner should be able to update hotel information. Such as the name of the hotel andaddress, etc.
  4.2.2 Actors:- Hotel Owner
  4.2.3 Preconditions:
    - User is authenticated
    - User has role of Hotel Owner
    - User has access to Hotel information page
  4.2.4 Basic course of events/happy path:
    1. Press edit hotel information button
    2. Show Edit Hotel Information page,with fields already filled from last values.
    3. Update or change field values
    4. Validate the fields
    5. Update Hotel Information in the database.
    6. Show success message.
    7. Go back to Dashboard
  4.2.5 Alternative path:
    1. (4) If validation fails show error
  4.2.6 Post condition:
    1. User will get redirected to the dashboard for his specific user
  4.2.7 Author Name:Bilal Pervez 4 December
    \`\`\`
    - Output: Hotel Owner - Update Hotel Information\n\n
    Agent:
    - Use case specification: {{${useCaseSpec}}} \n
    - Output: 
    `;

    const result = await this.generateTextResult(prompt);
    return result.slice(0, 100);
  }
}

const ucnGen = new UseCaseNameGenerator(model);
module.exports = ucnGen;
