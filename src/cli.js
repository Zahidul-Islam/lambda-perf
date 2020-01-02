import program from "commander";

import listFunctions from "../lib/listFunctions";
import initialize from "../lib/initializer";
import cleaner from "../lib/cleaner";
import executeTasks from "../lib/tasks";

program.version("0.0.1");

program
  .command("list")
  .description("list all lambda functions")
  .alias("ls")
  .option("-r, --region <string>", "AWS lambda region")
  .action(listFunctions);

program
  .command("create")
  .description("create load tests")
  .option("-n, --number <number>", "number of requests", parseInt)
  .option("-p, --parallel <boolean>", "enable parallel")
  .option("-a, --arn <string>", "aws lambda arn")
  .option("-d, --data <string>", "aws lambda payload")
  .action(initialize);

program
  .command("delete")
  .description("delete lambda alias")
  .alias("del")
  .option("-a, --arn <string>", "aws lambda arn")
  .action(cleaner);

program
  .command("exectute")
  .description("execute load tests")
  .alias("exec")
  .option("-n, --number <number>", "number of requests", parseInt)
  .option("-p, --enableParallel <boolean>", "enable parallel")
  .option("-a, --arn <string>", "aws lambda arn")
  .option("-d, --payload <string>", "aws lambda payload")
  .action(executeTasks);

program.on("--help", function() {
  console.log("");
  console.log("Examples:");
  console.log("  $ lperf ls -r us-east-x");
  console.log(
    '  $ lperf create --arn arn:aws:lambda:us-east-x:xxxxxxxx:function:lambda-function-name -n 5 -p false -d \'{ "key": "value" }\''
  );
  console.log(
    "  $ lperf delete --arn arn:aws:lambda:us-east-x:xxxxxxxx:function:lambda-function-name"
  );
  console.log(
    "  $ lperf exec --arn arn:aws:lambda:us-east-x:xxxxxxxx:function:lambda-function-name -n 5 -p true"
  );
});

program.parse(process.argv);
