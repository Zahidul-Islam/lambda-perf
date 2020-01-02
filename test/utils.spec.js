const { expect } = require("chai");
const rewire = require("rewire");

const utils = rewire("../lib/utils");

describe("utils", () => {
  describe("#lambdaClientFromARN()", () => {
    let lambdaClientFromArnFn;
    before(() => {
      lambdaClientFromArnFn = utils.__get__("lambdaClientFromARN");
    });
    it("it should return valid lambda region", () => {
      const lambdaARN =
        "arn:aws:lambda:us-east-1:920141199774:function:serverless-etl-dev-hello";
      const lambda = lambdaClientFromArnFn(lambdaARN);

      expect(lambda.config.region).to.equals(
        "us-east-1",
        "lambda was deployed in us-east-1"
      );
    });

    it("It should throw an Invalid ARN error", () => {
      const lambdaARN =
        "arn:aws:us-east-1:920141199774:function:serverless-etl-dev-hello";
      const errorMessage = `Invalid ARN: ${lambdaARN}`;
      expect(() => lambdaClientFromArnFn(lambdaARN)).to.throw(errorMessage);
    });
  });
});
