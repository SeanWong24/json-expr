import { parseArgs } from "@std/cli/parse-args";
import { Expr, Fns, JsonEx } from "./mod.ts";
import DEFAULT_CORE_FNS from "../fns/core-fns.ts";
import DEFAULT_FNS from "../fns/fns.ts";

if (import.meta.main) {
  const argDict = parseArgs(
    Deno.args,
    { collect: ["corefns", "fns"], negatable: ["default"] },
  );
  const jsonPath = argDict["_"][0];
  if (!jsonPath) {
    console.log(
      `Usage: json-ex <OPTIONS> <JOSN_FILE_PATH!>\n`,
      `\nOPTIONS:\n`,
      `--no-default: not to load the default functions\n`,
      `--corefns=<FUNCTIONS_DEFINITION_FILE_PATH>: add custom core functions, which can be specified multiple times\n`,
      `--fns=<FUNCTIONS_DEFINITION_FILE_PATH>: add custom core functions, which can be specified multiple times\n`,
    );
    Deno.exit();
  }
  const resolvedPath =
    new URL(jsonPath.toString(), `file://${Deno.cwd()}/`).href;
  const expr: Expr =
    (await import(resolvedPath, { with: { type: "json" } })).default;
  const jsonEx = new JsonEx();
  if (argDict.default !== false) {
    jsonEx.addCoreFns(DEFAULT_CORE_FNS);
    jsonEx.addFns(DEFAULT_FNS);
  }
  for (const fnsPath of argDict.corefns ?? []) {
    if (!fnsPath) {
      continue;
    }
    const resolvedCoreFnsPath =
      new URL(fnsPath.toString(), `file://${Deno.cwd()}/`).href;
    const fns: Fns =
      (await import(resolvedCoreFnsPath, { with: { type: "json" } })).default;
    jsonEx.addCoreFns(fns);
  }

  for (const fnsPath of argDict.fns ?? []) {
    if (!fnsPath) {
      continue;
    }
    const resolvedFnsPath =
      new URL(fnsPath.toString(), `file://${Deno.cwd()}/`).href;
    const fns: Fns =
      (await import(resolvedFnsPath, { with: { type: "json" } })).default;
    jsonEx.addFns(fns);
  }
  const value = await jsonEx.eval(expr, { basePath: resolvedPath });
  console.info(value);
}
