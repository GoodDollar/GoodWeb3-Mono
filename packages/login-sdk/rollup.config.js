import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const packageJson = require("./package.json");

export default [
  {
    input: "src/index.ts",
    external: [
      "react",
      "react-dom",
      "web3",
      "@gooddollar/goodprotocol/artifacts/contracts/Interfaces.sol/IIdentity.json",
      "@gooddollar/goodprotocol/releases/deployment.json"
    ],
    output: [
      {
        file: packageJson.main,
        format: "cjs"
      },
      {
        file: packageJson.module,
        format: "es"
      }
    ],
    plugins: [
      resolve({ preferBuiltins: true, mainFields: ["browser"] }),
      nodeResolve({ extensions: [".ts", ".tsx", ".js"] }),
      json(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json", sourceMap: true, inlineSources: true })
    ]
  }
];
