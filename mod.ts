export type Expr =
  | string
  | number
  | object
  | boolean
  | Expr[]
  | null
  | undefined;
// deno-lint-ignore ban-types
export type NativeFns = Record<string, Function>;

type EvaluationOptions = {
  nativeFns: NativeFns;
  basePath: string;
};

export const builtIns: NativeFns = {
  str: (v: unknown) => v?.toString() ?? "",
  int: (v: string) => Number.parseInt(v),
  float: (v: string) => Number.parseFloat(v),
  arr: (...args: unknown[]) => args,

  get: (i: string | number, obj: Record<string | number, unknown>) => obj?.[i],
  set: (
    i: string | number,
    v: unknown,
    obj: Record<string | number, unknown>,
  ) => obj && (obj[i] = v),
  len: (v: string | Array<number>) => v.length,
  print: console.log,

  neg: (x: number) => -x,
  add: (a: number, b: number) => a + b,
  sub: (a: number, b: number) => a - b,
  mul: (a: number, b: number) => a * b,
  div: (a: number, b: number) => a / b,
  pow: (a: number, b: number) => a ** b,
  mod: (a: number, b: number) => a % b,

  eq: (a: unknown, b: unknown) => a == b,
  se: (a: unknown, b: unknown) => a === b,
  ne: (a: unknown, b: unknown) => a != b,
  nse: (a: unknown, b: unknown) => a !== b,
  gt: (a: number | string, b: number | string) => a > b,
  lt: (a: number | string, b: number | string) => a < b,
  gte: (a: number | string, b: number | string) => a >= b,
  lte: (a: number | string, b: number | string) => a <= b,

  and: (a: Expr, b: Expr) => a && b,
  or: (a: Expr, b: Expr) => a || b,
  not: (v: unknown) => !v,

  cond: async (options: EvaluationOptions, ...args: Expr[]) => {
    for (let i = 0; i * 2 < args.length; i++) {
      const predicate = args[i * 2];
      const handler = args[i * 2 + 1];
      if (await evaluate(predicate, options)) {
        return await evaluate(handler, options);
      }
    }
  },
  def: (options: EvaluationOptions, name: string, expr: Expr) => {
    const handler = async (...args: unknown[]) => {
      return await evaluate(expr, {
        ...options,
        nativeFns: {
          ...options.nativeFns,
          args: () => args,
          arg: (i: number) => args[i],
        },
      });
    };
    builtIns[name] = handler;
  },
  use: async (options: EvaluationOptions, jsonPath: string) => {
    const resolvedPath = new URL(jsonPath, options.basePath).href;
    const expr = (await import(resolvedPath, {
      with: { type: "json" },
    })).default;
    await evaluate(expr, { ...options, basePath: resolvedPath });
  },
};

const DEFAULT_EVALUATION_OPTIONS = { nativeFns: builtIns, basePath: "" };

export async function evaluate(
  expr: Expr,
  options: Partial<EvaluationOptions> = {},
): Promise<Expr> {
  if (!Array.isArray(expr)) {
    return expr;
  }
  const _options = { ...DEFAULT_EVALUATION_OPTIONS, ...options };
  let result: Expr = void 0;
  for (let i = 0; i < expr.length; i++) {
    const curr = expr[i];
    const args = expr[i + 1];
    if (typeof curr === "string" && Array.isArray(args)) {
      if (!_options.nativeFns[curr]) {
        throw new Error(`${curr} is not defined.`);
      }
      i++;
      if (["def", "cond", "use"].includes(curr)) {
        result = await _options.nativeFns[curr]?.(_options, ...args);
        continue;
      }
      result = await _options.nativeFns[curr]?.(
        ...(await Promise.all(
          args.map(async (arg) => await evaluate(arg, _options)),
        )),
      );
      continue;
    }
    result = await evaluate(curr, _options);
  }
  return result;
}

if (import.meta.main) {
  const jsonPath = Deno.args[0];
  if (!jsonPath) {
    console.log(`Usage: json-exp <JOSN_FILE_PATH>`);
    Deno.exit();
  }
  const resolvedPath = new URL(jsonPath, `file://${Deno.cwd()}/`).href;
  const expr: Expr =
    (await import(resolvedPath, { with: { type: "json" } })).default;
  const value = await evaluate(expr, { basePath: resolvedPath });
  console.info("final evaluated value:", value);
}
