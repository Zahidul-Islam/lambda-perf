const AWS = require("aws-sdk");

const lambdaClientFromARN = lambdaARN => {
  if (typeof lambdaARN !== "string" || lambdaARN.split(":").length !== 7) {
    throw new Error("Invalid ARN: " + lambdaARN);
  }
  const region = lambdaARN.split(":")[3];
  return new AWS.Lambda({ region });
};

/**
 * Check whether a Lambda Alias exists or not, and return its data.
 */
const checkLambdaAlias = (lambdaARN, alias) => {
  const params = {
    FunctionName: lambdaARN,
    Name: alias
  };
  const lambda = lambdaClientFromARN(lambdaARN);
  return lambda.getAlias(params).promise();
};

/**
 * Update a given Lambda Function's memory size (always $LATEST version).
 */
const setLambdaPower = (lambdaARN, value) => {
  const params = {
    FunctionName: lambdaARN,
    MemorySize: parseInt(value, 10)
  };
  const lambda = lambdaClientFromARN(lambdaARN);
  return lambda.updateFunctionConfiguration(params).promise();
};

/**
 * Publish a new Lambda Version (version number will be returned).
 */
const publishLambdaVersion = (lambdaARN /*, alias*/) => {
  const params = {
    FunctionName: lambdaARN
  };
  const lambda = lambdaClientFromARN(lambdaARN);
  return lambda.publishVersion(params).promise();
};

/**
 * Delete a given Lambda Version.
 */
const deleteLambdaVersion = (lambdaARN, version) => {
  const params = {
    FunctionName: lambdaARN,
    Qualifier: version
  };
  const lambda = lambdaClientFromARN(lambdaARN);
  return lambda.deleteFunction(params).promise();
};

/**
 * Create a new Lambda Alias and associate it with the given Lambda Version.
 */
const createLambdaAlias = (lambdaARN, alias, version) => {
  const params = {
    FunctionName: lambdaARN,
    FunctionVersion: version,
    Name: alias
  };
  const lambda = lambdaClientFromARN(lambdaARN);
  return lambda.createAlias(params).promise();
};

/**
 * Create a new Lambda Alias and associate it with the given Lambda Version.
 */
const updateLambdaAlias = (lambdaARN, alias, version) => {
  const params = {
    FunctionName: lambdaARN,
    FunctionVersion: version,
    Name: alias
  };
  const lambda = lambdaClientFromARN(lambdaARN);
  return lambda.updateAlias(params).promise();
};

/**
 * Delete a given Lambda Alias.
 */
const deleteLambdaAlias = (lambdaARN, alias) => {
  const params = {
    FunctionName: lambdaARN,
    Name: alias
  };
  const lambda = lambdaClientFromARN(lambdaARN);
  return lambda.deleteAlias(params).promise();
};

/**
 * Invoke a given Lambda Function:Alias with payload and return its logs.
 */
const invokeLambda = (lambdaARN, alias, payload) => {
  const params = {
    FunctionName: lambdaARN,
    Qualifier: alias,
    Payload: payload,
    LogType: "Tail" // will return logs
  };

  const lambda = lambdaClientFromARN(lambdaARN);
  return lambda.invoke(params).promise();
};

/**
 * Compute average price and returns with average duration.
 */
const computePrice = (minCost, minRAM, value, duration) => {
  // compute official price per 100ms
  const pricePer100ms = (value * minCost) / minRAM;
  // quantize price to upper 100ms (billed duration) and compute avg price
  return Math.ceil(duration / 100) * pricePer100ms;
};

const parseLogAndExtractDurations = data => {
  return data.map(log => {
    const logString = base64decode(log.LogResult || "");
    return extractDuration(logString);
  });
};

/**
 * Copute average duration
 */
const computeTotalCost = (minCost, minRAM, value, durations) => {
  if (!durations || !durations.length) {
    return 0;
  }

  // compute corresponding cost for each durationo
  const costs = durations.map(duration =>
    computePrice(minCost, minRAM, value, duration)
  );

  // sum all together
  return costs.reduce((a, b) => a + b, 0);
};

/**
 * Copute average duration
 */
const computeAverageDuration = durations => {
  if (!durations || !durations.length) {
    return 0;
  }

  // 20% of durations will be discarted (trimmed mean)
  const toBeDiscarded = parseInt((durations.length * 20) / 100, 10);

  const newN = durations.length - 2 * toBeDiscarded;

  // compute trimmed mean (discard 20% of low/high values)
  const averageDuration =
    durations
      .sort() // sort numerically
      .slice(toBeDiscarded, -toBeDiscarded) // discard first/last values
      .reduce((a, b) => a + b, 0) / newN; // sum all together
  return averageDuration;
};

/**
 * Extract duration (in ms) from a given Lambda's CloudWatch log.
 */
const extractDuration = log => {
  // Example log message:
  // Duration: 702.16 ms Billed Duration: 800 ms Memory Size: 512 MB Max Memory Used: 15 MB
  const durationSplit = log.split("\tDuration: ");
  if (durationSplit.length < 2) return 0;

  const durationStr = durationSplit[1].split(" ms")[0];
  return parseFloat(durationStr);
};

/**
 * Encode a given string to base64.
 */
const base64decode = str => {
  return Buffer.from(str, "base64").toString();
};

/**
 * Generate a list of size n.
 */
const range = n => {
  if (n === null || typeof n === "undefined") {
    n = -1;
  }
  return Array.from(Array(n).keys());
};

module.exports = {
  checkLambdaAlias,
  setLambdaPower,
  publishLambdaVersion,
  deleteLambdaVersion,
  createLambdaAlias,
  updateLambdaAlias,
  deleteLambdaAlias,
  invokeLambda,
  computePrice,
  parseLogAndExtractDurations,
  computeTotalCost,
  computeAverageDuration,
  extractDuration,
  base64decode,
  range
};
