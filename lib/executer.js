import utils from "../lib/utils";

const minRAM = parseInt(process.env.MIN_RAM, 10);
const minCost = parseFloat(process.env.MIN_COST);
const powerValues = process.env.MEMORY_ALLOCATION.split(",");

const validateInput = (lambdaARN, num) => {
  if (!lambdaARN) {
    throw new Error("Missing or empty lambdaARN");
  }
  if (!num || isNaN(num)) {
    throw new Error("Invalid num: " + num);
  }
};

const convertPayload = payload => {
  if (typeof payload !== "string" && typeof payload !== "undefined") {
    // console.log("Converting payload to string from ", typeof payload);
    payload = JSON.stringify(payload);
  }
  return payload;
};

const runInParallel = async (num, lambdaARN, lambdaAlias, payload) => {
  const results = [];
  // run all invocations in parallel ...
  const invocations = utils.range(num).map(async () => {
    const data = await utils.invokeLambda(lambdaARN, lambdaAlias, payload);
    // invocation errors return 200 and contain FunctionError and Payload
    if (data.FunctionError) {
      throw new Error("Invocation error: " + data.Payload);
    }
    results.push(data);
  });
  // ... and wait for results
  await Promise.all(invocations);
  return results;
};

const runInSeries = async (num, lambdaARN, lambdaAlias, payload) => {
  const results = [];
  for (let i = 0; i < num; i++) {
    // run invocations in series
    const data = await utils.invokeLambda(lambdaARN, lambdaAlias, payload);
    // invocation errors return 200 and contain FunctionError and Payload
    if (data.FunctionError) {
      throw new Error("Invocation error: " + data.Payload);
    }
    results.push(data);
  }
  return results;
};

const computeStatistics = (results, value, lambdaARN, lambdaAlias) => {
  // use results (which include logs) to compute average duration ...

  const durations = utils.parseLogAndExtractDurations(results);

  const averageDuration = utils.computeAverageDuration(durations);
  // console.log("Average duration: ", averageDuration);

  // ... and overall statistics
  const averagePrice = utils.computePrice(
    minCost,
    minRAM,
    value,
    averageDuration
  );

  // .. and total cost (exact $)
  const totalCost = utils.computeTotalCost(minCost, minRAM, value, durations);

  const stats = {
    "Lambda ARN": `${lambdaARN}:${lambdaAlias}`,
    "Average Price": averagePrice,
    "Average Duration": averageDuration,
    "Total Cost": totalCost
  };

  //console.log("Stats: ", JSON.stringify(stats, null, 2));
  return stats;
};

export default async function executer(options) {
  const { arn: lambdaARN, number, enableParallel, payload } = options;
  validateInput(lambdaARN, number);
  let results = [];

  for (let i = 0; i < powerValues.length; i++) {
    const value = powerValues[i];
    const lambdaAlias = `RAM${value}`;
    let result;

    if (enableParallel) {
      result = await runInParallel(
        number,
        lambdaARN,
        lambdaAlias,
        convertPayload(payload)
      );
    } else {
      result = await runInSeries(
        number,
        lambdaARN,
        lambdaAlias,
        convertPayload(payload)
      );
    }

    const stats = computeStatistics(result, value, lambdaARN, lambdaAlias);
    //console.log(stats);
    results.push(stats);
  }
  // console.table(results);
  return results;
}
