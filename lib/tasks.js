import chalk from "chalk";

import initialize from "./initializer";
import cleaner from "./cleaner";
import executer from "./executer";
import Listr from "listr";

export default async function executeTasks(options) {
  const { arn, enableParallel } = options;
  let results;

  const tasks = new Listr([
    {
      title: "Initializing λ functions",
      task: async () => await initialize(options)
    },
    {
      title: `Eexcuting λ functions in ${
        enableParallel && enableParallel ? "async" : "sync"
      }`,
      task: async () => {
        results = await executer(options);
      }
    },
    {
      title: "Cleaning all λ functions",
      task: async () => await cleaner(options)
    }
  ]);

  await tasks.run();
  if (results) {
    console.log(
      `  ${chalk.green.bold("DONE")} ${chalk.blackBright.bold(
        "λ function statistics: "
      )}`
    );
    console.table(results);
  }
}
