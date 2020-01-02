// const { expect } = require("chai");
// const rewire = require("rewire");

// const cleaner = rewire("../lib/cleaner");

// describe("cleaner", () => {
//   const env = Object.assign({}, process.env);
//   before(() => {
//     process.env.MEMORY_ALLOCATION = "128,256,512,1024,1536,3008";
//   });

//   after(() => {
//     process.env = env;
//   });

//   it("It should throw error for undefined lambdaARN", () => {
//     const validateInputFn = cleaner.__get__("validateInput");
//     const lambdaARN = undefined;
//     const errorMessage = "Missing or empty lambdaARN";

//     expect(() => validateInputFn(lambdaARN)).to.throw(errorMessage);
//   });
// });
