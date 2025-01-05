const dotenv = require("dotenv");
dotenv.config();

const tcGen = require("./test-case-gen");

async function generateTestCases(useCase) {
  const flows = await tcGen.analyzeUseCase(useCase);
  // console.log(JSON.stringify(flows));

  const subFlowScenarios = await tcGen.generateSubFlowScenario(
    flows["sub_flow"],
    flows["main_flow"]
  );
  // console.log(subFlowScenarios);
  const refinedScenarios = await tcGen.refineScenario(
    subFlowScenarios,
    useCase
  );
  // console.log(refinedScenarios);

  const mainFlowTestCases = await tcGen.generateMainFlowTestCases(
    flows["main_flow"]
  );
  // console.log("⭐", { mainFlowTestCases });

  const finalValidatedTCs = [];
  for (const scenario of refinedScenarios) {
    const testCases = await tcGen.generateTestCase(scenario, useCase);

    const validatedTestCases = await tcGen.validateTestcase(
      scenario,
      testCases
    );
    finalValidatedTCs.push(...validatedTestCases);
  }
  // console.log("⭐", { finalValidatedTCs });

  const finalResult = [...mainFlowTestCases, ...finalValidatedTCs];
  return finalResult;
}

module.exports = generateTestCases;
