import { parseArgs } from "@std/cli/parse-args";
import { Expr, Fns, JsonEx } from "./mod.ts";

if (import.meta.main) {
  const argDict = parseArgs(
    Deno.args,
  );
  const jsonPath = argDict["_"][0];
  if (!jsonPath) {
    console.log(
      `Usage: json-ex --corefns=<FUNCTIONS_DEFINITION_FILE_PATH> --fns=<FUNCTIONS_DEFINITION_FILE_PATH> <JOSN_FILE_PATH!>`,
    );
    Deno.exit();
  }
  const resolvedPath =
    new URL(jsonPath.toString(), `file://${Deno.cwd()}/`).href;
  const expr: Expr =
    (await import(resolvedPath, { with: { type: "json" } })).default;
  const jsonEx = new JsonEx();
  if (argDict.corefns) {
    const resolvedCoreFnsPath =
      new URL(argDict.corefns.toString(), `file://${Deno.cwd()}/`).href;
    const fns: Fns =
      (await import(resolvedCoreFnsPath, { with: { type: "json" } })).default;
    jsonEx.addCoreFns(fns);
  }
  if (argDict.fns) {
    const resolvedFnsPath =
      new URL(argDict.fns.toString(), `file://${Deno.cwd()}/`).href;
    const fns: Fns =
      (await import(resolvedFnsPath, { with: { type: "json" } })).default;
    jsonEx.addFns(fns);
  }
  const value = await jsonEx.eval(expr, { basePath: resolvedPath });
  console.info("evaluated value:", value);
}
