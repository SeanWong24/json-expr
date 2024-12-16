#!/usr/bin/env node

import process from "node:process";
import minimist from "minimist";
import Evaluator, { Expr, FnDict } from "./mod.js";
import DEFAULT_FNS from "./default-fns/index.js";

try {
  const argDict = minimist(process.argv.slice(2));

  const jsonPath = argDict["_"][0];
  if (!jsonPath) {
    console.log(
      `Usage: json-ex <OPTIONS> <JOSN_FILE_PATH!>\n`,
      `\nOPTIONS:\n`,
      `--no-default: do not to load the default functions\n`,
      `--fns=<FUNCTIONS_DEFINITION_FILE_PATH>: add custom functions, which can be specified multiple times\n`,
    );
    process.exit();
  }
  const resolvedPath =
    new URL(jsonPath.toString(), `file://${process.cwd()}/`).href;
  const expr: Expr =
    (await import(resolvedPath, { with: { type: "json" } })).default;
  const evaluator = new Evaluator();
  if (argDict.default !== false) {
    evaluator.addFns(DEFAULT_FNS);
  }

  const fns = Array.isArray(argDict.fns) ? argDict.fns : [argDict.fns];
  for (const fnsPath of fns ?? []) {
    if (!fnsPath) {
      continue;
    }
    const resolvedFnsPath =
      new URL(fnsPath.toString(), `file://${process.cwd()}/`).href;
    const fns: FnDict = (await import(resolvedFnsPath)).default;
    evaluator.addFns(fns);
  }
  const value = await evaluator.eval(expr, { basePath: resolvedPath });
  console.info(value);
} catch (e) {
  console.error(e);
}
