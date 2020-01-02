# λperf

λperf is a CLI tool for measuring aws lambda performance. It provides a flexible facility for generating various workloads and perform synchronous and asynchronous lambda invocation.

The focus of λperf is make aws lambda load testing easier when the function have no REST endpoint.

## Install

- Clone the repo: `git clone .... && cd ..`
- Rename the `.env.template` file: `mv .env.template .env`
- Install pacages: `npm i`
- Symlink the package folder: `npm link`

## Usage

```
$ lperf --help
Usage: lperf [options] [command]

Options:
  -V, --version            output the version number
  -h, --help               output usage information

Commands:
  list|ls [options]        list all lambda functions
  create [options]         create load tests
  delete|del [options]     delete lambda alias
  exectute|exec [options]  execute load tests

Examples:
  $ lperf ls -r us-east-x
  $ lperf create --arn arn:aws:lambda:us-east-x:xxxxxxxx:function:lambda-function-name -n 5 -p false -d '{ "key": "value" }'
  $ lperf delete --arn arn:aws:lambda:us-east-x:xxxxxxxx:function:lambda-function-name
  $ lperf exec --arn arn:aws:lambda:us-east-x:xxxxxxxx:function:lambda-function-name -n 5 -p true
```


