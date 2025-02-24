const model = require("../LLMs/gemini");
// const model = require("./LLMs/llama");
// const model = require("./LLMs/mistral-groq");
// const model = require("./LLMs/mistral");
const retryAsync = require("../utils/retryAsync");

const extractJSON = (str) => {
  const json = str.match(/(\[|{)[\s\S]*(\]|})/g)[0];
  return JSON.parse(json);
};

// https://gitmind.com/app/docs/myw4iqd9

class TestCaseGenerator {
  constructor(model) {
    this.model = model;
  }

  generateTextResult = retryAsync(async (prompt) => {
    const result = await this.model.generateContent(prompt);
    return result;
  });

  // 1. DATA PROCESSING
  // Condition Extractor
  async extractConditions(useCaseSpec) {
    const prompt = `The following is a Condition Extractor agent that is designed to analyze the use case specification to identify interactive elements and their associated conditions. This is a single use case specification: {{${useCaseSpec}}}.\n\n 
    This agent ensure that all conditions that need to be tested are captured accurately, allowing for comprehensive test coverage. The following rules must be applied:\n
    1. Do Not Arbitrarily Create Conditions: The agent must only extract conditions that are explicitly mentioned in the use case flow. Do not create additional conditions or assumptions that are not stated in the use case.\n
    2. Consistency in Element Types: The agent must consistently categorize elements into one of the predefined types, even if the use case description is vague or incomplete. This is to ensure that filtering process of elements works effectively.\n\n
    The output is a JSON object that includes: 1-The name of each interactive element, 2-The conditions that make the element valid and invalid, 3-The type of the element. And the output should be in the following format (do not include trailing comma in the last element in the object):\n
    \`\`\`json
    {
      "The name of the interactive element": {
        "condition": {
          "valid": "The condition that makes the element valid",
          "invalid": "The condition that makes the element invalid"
        },
        "type": "The type of the element"
      }
    }
    \`\`\`
    Agent:
    `;

    const result = await this.generateTextResult(prompt);
    return extractJSON(result);
  }

  // Use case analyzer
  async analyzeUseCase(useCaseSpec) {
    const prompt = `The following is a Use Case Analyzer agent that is  designed to analyze and extract essential flow details (main flow, alternative flows, exception flows) from the use case specification. This agent ensures that only actionable process steps are retained, excluding unnecessary information such as use case goals, descriptions, preconditions, post conditions and so on.\n\nThe output of the Use case Analyzer are extracted flows that formatted into JSON blocks.\n\n
    Example:\n
    - Use case specification:
    \`\`\`text\n
    Use case name : Registry
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
    - Output:
    \`\`\`json
    {
      "main_flow": [
        "Step 1: Learner fills in the username field by a valid username, a valid username must be over 8 characters and below 30 characters.",
        "Step 2: Learner fills in the password field by a valid password, a valid password must be over 8 characters and below 30 characters, contains at least one of each kind: a normal character, a capitalize character, a number and a special character. A valid password cannot be the same as the username.",
        "Step 3: Learner presses "Registry" button.",
        "Step 4: System redirects learner to Home page."
      ],
      "sub_flow": [
        {
          "name": "Learner registers by email.",
          "steps": [
            "Step 1: Learner clicks on the Mail icon.",
            "Step 2: Learner fills in the email field by a valid email, a valid email must be in the correct format.",
            "Go back to step 2 in the main flow."
          ]
        },        
        {
          "name": "Learner enters invalid username.",
          "steps": [
            "Step 1: Learner fills in the username field by an invalid username.",
            "Step 4: System shows a notification that the username is invalid."
          ]        
        }
      ]
    }\`\`\` \n\n
    This is a single use case specification: {{${useCaseSpec}}}
    Output: 
    `;

    const result = await this.generateTextResult(prompt);
    return extractJSON(result);
  }

  // 2. TEST DESIGN
  // Condition Scenario Generator
  async generateConditionScenario(conditions) {
    const prompt = `The following is a Condition Scenario Generator Agent that is designed to generate test scenarios that test all the conditions for interactive elements mentioned in a use case specification. This agent receives input as a JSON object containing a list of interactive elements and their associated conditions. Upon receiving the input, the agent processes in the following steps:\n
    1. Generating Scenarios: For each invalid condition, the agent generates a test scenario. The generated scenario names are clear and organized to facilitate subsequent steps.\n
    2. Ensuring Relevance: The agent strictly follows the rule to avoid generating scenarios for elements or conditions not specified in the input, ensuring the relevance and accuracy of the scenarios.\n
    This process is guided by the following rules, which must be applied:\n
    1. Do not generate test scenarios for elements or conditions not mentioned in the given element list.
    2. Generate only the scenario names without including the detailed steps.\n\n
    Example output of the Condition Scenario Generator agent:\n
    \`\`\`json["1. Username below 8 characters", "2. Username over 30 characters", "3. Username has been registered", "4. Password below 8 characters", "5. Password over 30 characters", "6. Password does not contain at least one normal character", "7. Password does not contain at least one capitalize character", "8. Password does not contain at least one number", "9. Password does not contain at least one special character", "10. Password is the same as the username", "11. Email is not an existing email", "12. Email with the wrong format"]\`\`\` \n\n

    Input: {{${JSON.stringify(conditions)}}}
    Output (do not include trailing comma in the last element in both array and object):
    `;
    const result = await this.generateTextResult(prompt);
    return extractJSON(result);
  }

  // Main Flow Scenario Generator
  async generateMainFlowScenario(mainFlow) {
    const prompt = `The following is a Main Flow Scenario Generator Agent that is designed to generate all possible scenarios based on the details provided in the main flow of the use case. This involves predicting various sequences of user interactions that could potentially lead to different outcomes or states of the application. The following rules must be applied to generate accurate and comprehensive scenarios:\n
  1. Defining a Test Scenario: Given agent a test scenario definition as a high-level description of what to test in a particular functionality or feature of the software application. It is essentially a statement that outlines a specific situation or aspect to be tested.\n
  2. Preventing the creation of test scenarios that validate individual steps in the flow: This agent is instructed not to create scenarios that only validate individual steps in the main flow. Instead, each scenario must be independent and include a complete sequence of events.\n\n

  Example:\n
  - main_flow:\n
  \`\`\`json
  [
    "Step 1: User in the shopping cart page and User has added items to the shopping cart.",
    "Step 2: User select items to checkout by selecting each items by clicking on checkbox before item.",
    "Step 3: System displays the summary costs.",
    "Step 4: User click the \"Checkout\" button.",
    "Step 5: System process to checkout.",
    "- User is redirected to page that shows one or many new orders of all the items user have chosen.",
    "- Products from different shops will be separate into different orders , products from the same shop is in one order ."
  ],
  \`\`\`

  - Agent output:\n
  \`\`\`json["Successful Checkout with Single Shop Products", "Successful Checkout with Multiple Shops Products"]\`\`\` \n\n

  - main_flow: ${JSON.stringify(mainFlow)}
  - Agent output:
  `;

    const result = await this.generateTextResult(prompt);
    return extractJSON(result);
  }

  // Sub flow Scenario Generator
  async generateSubFlowScenario(mainFlow, subFlow) {
    const prompt = `The following is a Sub Flow Scenario Generator Agent that is designed to generate test scenarios for other flows(sub-flows) except for the main flow within a use case, such as alternative flows, exception flows, or validation flows. The primary input for this agent is the description of the main flow along with one of the sub-flows. This agent ensures that specific cases, often encountered as deviations or exceptions from the main flow, are thoroughly tested. The desired output of Sub Flow Scenario Generator agent is a list of scenario names that represent meaningful transitions from the main flow to the alternative or exception flow. The following rules must be applied when generating test scenarios:\n
    1. Exclusion of User Intent: Test scenarios should not consider user intent (e.g., accidental vs. intentional actions). This rule ensures that the generated scenarios focus on the actions and interactions themselves rather than the motivations behind them.
    2. Focus on Sub-Flows only: Test scenarios MUST NOT BE generated for the main flow but should test the transitions from main flow to sub-flows.
    3. Preventing the creation of test scenarios that validate individual steps in the flow: This agent is instructed not to create scenarios that only validate individual steps in the main flow. Instead, each scenario must be independent and include a complete sequence of events.\n\n

    Example of the output format (do not include trailing comma in the last element in both array and object):
    \`\`\`json["Test scenario name 1", "Test scenario name 2"]\`\`\`

    Input:
    - sub_flow: ${JSON.stringify(subFlow)}
    - main_flow: ${JSON.stringify(mainFlow)}
    Output of the Sub Flow Scenario Generator Agent:
    `;
    const result = await this.generateTextResult(prompt);
    return extractJSON(result);
  }

  // Scenario Refiner
  async refineScenario(scenarios, useCaseSpec) {
    const prompt = `The following is a Scenario Refiner Agent that is designed to reduce redundant and duplicate test scenarios. The following rules must be applied:\n
    1. Assess sufficiency: Making assessment of whether the provided test scenarios are sufficiently cover the use case according to the details of the use case specification.
    2. Remove redundant test scenarios: We define the redundant scenarios as the scenarios that test the features, actions, and behaviors that are not mentioned in the use case specification or the test scenarios to test the activities that hard to present, perform in real life, such as Page or System Load Failure, System Error, Network Error, or interactions with nonexistent objects.
    3. Eliminate duplicate scenarios: Agent should detect and erase all the duplicate scenarios to ensure that each scenario is unique.\n\n
    
    The inputs for this agent involves: List of generated test scenarios, and the use case specification. The output of this agent is a list of test scenarios that are sufficient and unique.
    
    Example of the output format (do not include trailing comma in the last element in both array and object):
    \`\`\`json["Test scenario name 1", "Test scenario name 2"]\`\`\`
    Input:
    - scenarios: ${JSON.stringify(scenarios)}
    - use_case: ${useCaseSpec}
    Output of the Scenario Refiner Agent:
    `;

    const result = await this.generateTextResult(prompt);
    return extractJSON(result);
  }

  // 2. TEST CASE GENERATION
  // Test case Generator
  async generateTestCase(scenario, useCaseSpec) {
    const prompt = `The following is a Test Case Generator Agent that is designed to generate test cases based on the two inputs, that are test scenario and the comprehensive details of the use case specification. The following rules must be applied:\n
    1. Clear Steps: Ensures that each test step is self-explanatory and independent.
    2. No References: Eliminates dependency between test cases. This rule prohibits referencing other test cases or instructions like \"do as mentioned.\"
    3. Align Actions to Match Scenario: Guarantees that the test case objectives and actions are aligned with the scenario name. This alignment is used for clarity and relevance, ensuring that the test case directly addresses the scenario described.

    Example of the output format (do not include trailing comma in the last element in both array and object):
    \`\`\`json[{
        "testCaseName": "Clear name of the test case so tester know what to test when they first read.",
        "objective": "Verify who doing what action or function in the test case and the summary of the final result of the test case",
        "steps": [
          "Describe the step.",
          "Describe the step.",
          "Describe the step."
        ],
        "expectedResult": "You inform the tester what should they see after doing all the steps."}]\`\`\`

    Input:
    - test scenarios: ${JSON.stringify(scenario)}
    - use case specification: ${useCaseSpec}
    Output of the Test Case Generator Agent:
    `;

    const result = await this.generateTextResult(prompt);
    return extractJSON(result);
  }

  // Test case Validator
  async validateTestcase(scenario, testCases) {
    const prompt = `The following is a Test Case Validator Agent that is specifically designed to validate the test cases generated based on the test scenarios. The agent\'s input includes:\n
    1. Test Scenario: The given Test Scenario was used to create set of test cases by the Test Case Generator agent.
    2. Test Cases: A set of test cases produced by the Test Case Generator agent, intended to test the given scenario.

    To review the reflect of test cases, The Test Case Validator follows a process of:\n
    1. Input Reception: The agent receives the test scenario and the corresponding test cases generated by the Test Case Generator.
    2. Criteria Checking: The agent evaluates each test case against the predefined validation criteria (test case name,objective, test steps, and expected output).
    3. Reflection Assessment: The agent marks each test case as either reflecting or not reflecting the scenario based on the evaluation.
    4. Explanation Generation: The agent provides a detailed explanation for each decision, justifying why a test case was marked as reflecting or not reflecting the scenario.

    Example of the output format (do not include trailing comma in the last element in both array and object):
    \`\`\`json[
      {
        "testCaseName": "Clear name of the test case so tester know what to test when they first read.",
        "objective": "Verify who doing what action or function in the test case and the summary of the final result of the test case",
        "steps": [
          "Describe the step.",
          "Describe the step.",
          "Describe the step."
        ],
        "expectedResult": "You inform the tester what should they see after doing all the steps.",
        "reflect": "yes/no",
        "explanation": " explain why you think this test case reflect the given test scenario or not"
      }
    ]\`\`\`

    Input:
    - test scenario: ${JSON.stringify(scenario)}
    - test cases: ${JSON.stringify(testCases)}
    Output of the Test Case Validator Agent:
    `;
    const result = await this.generateTextResult(prompt);
    return extractJSON(result);
  }

  // Main Flow Test case Generator
  async generateMainFlowTestCases(mainFlow) {
    const prompt = `The following is a Main Flow Test Case Generator Agent that is designed to generate test cases based on the main flow of an use case specification. The following rules must be applied:\n
    1. Straightforward: Focuses on the simplest path to achieve the use case's goal because the main flow is the most straightforward and successful scenario where nothing goes wrong, often referred to as the \"happy path\"
    2. Free of Alternative or Exceptional Paths: Do not account for errors, exceptions, or alternative routes because these are typically handled in separate alternative or exception flows.

    Example:\n
    - main_flow:\n
    \`\`\`json
    [
      "Step 1: User in the shopping cart page and User has added items to the shopping cart.",
      "Step 2: User select items to checkout by selecting each items by clicking on checkbox before item.",
      "Step 3: System displays the summary costs.",
      "Step 4: User click the \"Checkout\" button.",
      "Step 5: System process to checkout.",
      "- User is redirected to page that shows one or many new orders of all the items user have chosen.",
      "- Products from different shops will be separate into different orders , products from the same shop is in one order ."
    ],
    \`\`\`

    - Agent output:\n
  \`\`\`json[
      {
        "testCaseName": "Successful Checkout with Single Shop Products",
        "objective": "Verify that a user can successfully checkout items from a single shop and view a single order summary.",
        "steps": [
          "Step 1: User in the shopping cart page and User has added items to the shopping cart.",
          "Step 2: User selects items to checkout from the same shop by clicking on the checkboxes before each item.",
          "Step 3: System displays the summary costs.",
          "Step 4: User clicks the 'Checkout' button.",
          "Step 5: System processes the checkout.",
          "- User is redirected to a page that shows one new order containing all items selected.",
          "- Since all products are from the same shop, they appear in a single order."
        ]
      },
      {
        "testCaseName": "Successful Checkout with Multiple Shops Products",
        "objective": "Verify that a user can successfully checkout items from multiple shops and view separate orders for each shop.",
        "steps": [
          "Step 1: User in the shopping cart page and User has added items to the shopping cart.",
          "Step 2: User selects items from different shops by clicking on the checkboxes before each item.",
          "Step 3: System displays the summary costs.",
          "Step 4: User clicks the 'Checkout' button.",
          "Step 5: System processes the checkout.",
          "- The user is redirected to a page that shows multiple new orders from different shops, containing the selected items."
        ]
      }
    ]\`\`\` \n\n

    - main_flow: ${JSON.stringify(mainFlow)}
    - Agent output (do not include trailing comma in the last element in both array and object):
    `;

    const result = await this.generateTextResult(prompt);
    return extractJSON(result);
  }
}

const tcg = new TestCaseGenerator(model);
module.exports = tcg;
