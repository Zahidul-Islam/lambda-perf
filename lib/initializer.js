import utils from "./utils";

const powerValues = process.env.MEMORY_ALLOCATION.split(",");

const validateInput = lambdaARN => {
  if (!lambdaARN) {
    throw new Error("Missing or empty lambdaARN");
  }
  if (!powerValues.length) {
    throw new Error("Missing or empty env.powerValues");
  }
};

const verifyIfAliasExist = async (lambdaARN, alias) => {
  try {
    await utils.checkLambdaAlias(lambdaARN, alias);
    return true;
  } catch (error) {
    if (error.code === "ResourceNotFoundException") {
      // OK, the alias isn't supposed to exist
      //console.log("OK, even if missing alias ");
      return false;
    } else {
      //console.log("error during alias check:");
      throw error; // a real error :)
    }
  }
};

const createPowerConfiguration = async (
  lambdaARN,
  value,
  alias,
  aliasExists
) => {
  try {
    await utils.setLambdaPower(lambdaARN, value);
    const { Version } = await utils.publishLambdaVersion(lambdaARN);
    if (aliasExists) {
      await utils.updateLambdaAlias(lambdaARN, alias, Version);
    } else {
      await utils.createLambdaAlias(lambdaARN, alias, Version);
    }
  } catch (error) {
    if (error.message && error.message.includes("Alias already exists")) {
      // shouldn't happen, but nothing we can do in that case
      //console.log("OK, even if: ", error);
    } else {
      //console.log("error during inizialization for value " + value);
      throw error; // a real error :)
    }
  }
};

export default async function initialize(options) {
  const { arn: lambdaARN } = options;
  validateInput(lambdaARN);

  for (let i = 0; i < powerValues.length; i++) {
    const value = powerValues[i];
    const alias = `RAM${value}`;
    const aliasExists = await verifyIfAliasExist(lambdaARN, alias);
    await createPowerConfiguration(lambdaARN, value, alias, aliasExists);
  }
}
