const dotenv = require("dotenv");
dotenv.config();

const tcGen = require("./test-case-gen");
const ucnGen = require("./use-case-name-gen");

exports.generateTestCases = async (useCase, scenario) => {
  const finalValidatedTCs = [];

  const testCases = await tcGen.generateTestCase(scenario, useCase);
  const validatedTestCases = await tcGen.validateTestcase(scenario, testCases);

  for (const tc of validatedTestCases) {
    if (tc.reflect === "yes") {
      finalValidatedTCs.push(tc);
    }
  }
  return finalValidatedTCs;
};

exports.generateScenarios = async (useCase) => {
  const flows = await tcGen.analyzeUseCase(useCase);
  // console.log(JSON.stringify(flows));

  const mainFlowScenarios = await tcGen.generateMainFlowScenario(
    flows["main_flow"]
  );
  const subFlowScenarios = await tcGen.generateSubFlowScenario(
    flows["sub_flow"],
    flows["main_flow"]
  );
  // console.log(subFlowScenarios);
  const refinedScenarios = await tcGen.refineScenario(
    [...mainFlowScenarios, ...subFlowScenarios],
    useCase
  );
  // console.log(refinedScenarios);

  return refinedScenarios;
};

exports.generateUseCaseName = async (useCase) => {
  const name = await ucnGen.generate(useCase);
  return name;
};
