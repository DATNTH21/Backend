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
    const prompt = `The following is a Usecase Name Extractor agent that is designed to extract the name of a use case specification. The use case specification can have different format.\n\n 
    Example:\n
    - Use case specification:\n
    \`\`\`text\n
    Registry
    Actor : Learner
    Precondition : Learner is in Registry page.
    Main flow :
      Step 1: Learner fills in the username field by a valid username, a valid username must be over 8 characters and below 30 characters.
      Step 2: Learner fills in the password field by a valid password, a valid password must be over 8 characters and below 30 characters, contains at least one of each kind: a normal character, a capitalize character, a number and a special character. A valid password cannot be the same as the username.
      Step 3: Learner presses "Registry" button.
      Step 4: System redirects learner to Home page.
    Alternative flow 1: Learner registers by email.
      Step 1: Learner clicks on the Mail icon.
      Step 2: Learner fills in the email field by a valid email, a valid email must be in the correct format.
      Go back to step 2 in the main flow.
    Exception flow 1: Learner enters invalid username.
      Step 1: Learner fills in the username field by an invalid username.
      Step 4: System shows a notification that the username is invalid.
    \`\`\`
    - Output: Registry\n\n
    Agent:
    - Use case specification: {{${useCaseSpec}}} \n
    - Output: 
    `;

    const result = await this.generateTextResult(prompt);
    return result;
  }
}

const ucnGen = new UseCaseNameGenerator(model);
module.exports = ucnGen;
