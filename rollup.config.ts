const rollupTypescript = require("rollup-plugin-typescript2");

import resolve from "rollup-plugin-node-resolve"; // 依赖引用插件

export default {
  input: "./src/index.ts",
  plugins: [resolve({ extensions: ["ts"] }), rollupTypescript()],
  output: {
    file: "lib/index.js",
    format: "cjs",
  },
};
