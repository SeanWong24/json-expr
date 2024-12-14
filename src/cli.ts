import { parseArgs } from "jsr:@std/cli/parse-args";
import { Expr, FnDict, JsonEx } from "./mod.ts";
import DEFAULT_FNS from "./default-fns/index.ts";

try {
  const argDict = parseArgs(
    Deno.args,
    { collect: ["corefns", "fns"], negatable: ["default"] },
  );
  const jsonPath = argDict["_"][0];
  if (!jsonPath) {
    console.log(
      `Usage: json-ex <OPTIONS> <JOSN_FILE_PATH!>\n`,
      `\nOPTIONS:\n`,
      `--no-default: do not to load the default functions\n`,
      `--fns=<FUNCTIONS_DEFINITION_FILE_PATH>: add custom functions, which can be specified multiple times\n`,
    );
    Deno.exit();
  }
  const resolvedPath =
    new URL(jsonPath.toString(), `file://${Deno.cwd()}/`).href;
  const expr: Expr =
    (await import(resolvedPath, { with: { type: "json" } })).default;
  const jsonEx = new JsonEx();
  if (argDict.default !== false) {
    jsonEx.addFns(DEFAULT_FNS);
  }

  for (const fnsPath of argDict.fns ?? []) {
    if (!fnsPath) {
      continue;
    }
    const resolvedFnsPath =
      new URL(fnsPath.toString(), `file://${Deno.cwd()}/`).href;
    const fns: FnDict =
      (await import(resolvedFnsPath, { with: { type: "json" } })).default;
    jsonEx.addFns(fns);
  }
  const value = await jsonEx.eval(expr, { basePath: resolvedPath });
  console.info(value);
} catch (e) {
  console.error(e);
}
