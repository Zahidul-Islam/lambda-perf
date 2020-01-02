import utils from "../lib/utils";

const powerValues = process.env.MEMORY_ALLOCATION.split(",");

const validateInput = lambdaARN => {
  if (!lambdaARN) {
    throw new Error("Missing or empty lambdaARN");
  }
  if (!powerValues.length) {
    throw new Error("Missing or empty env.powerValues");
  }
};

const cleanup = async (lambdaARN, alias) => {
  try {
    const { FunctionVersion } = await utils.checkLambdaAlias(lambdaARN, alias);
    // delete both alias and version (could be done in parallel!)
    await utils.deleteLambdaAlias(lambdaARN, alias);
    await utils.deleteLambdaVersion(lambdaARN, FunctionVersion);
  } catch (error) {
    if (error.code === "ResourceNotFoundException") {
      console.error("OK, even if version/alias was not found");
      console.error(error);
    } else {
      console.error(error);
      throw error;
    }
  }
};

export default async function(options) {
  const { arn: lambdaARN } = options;
  validateInput(lambdaARN);

  const ops = powerValues.map(async value => {
    const alias = "RAM" + value;
    await cleanup(lambdaARN, alias);
  });

  await Promise.all(ops);
}
