import AWS from "aws-sdk";

export default async function listFunctions(options) {
  const region = options.region || "us-east-1";
  const lambda = new AWS.Lambda({ region });
  const list = await lambda.listFunctions().promise();
  list.Functions.map(func => console.log(func.FunctionArn));
}
