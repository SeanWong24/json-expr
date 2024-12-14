import { EvalOptions, Expr, SimpleFn, wrapSimpleFn } from "../mod.ts";

const fns: Record<string, SimpleFn> = {
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
};

for (const key in fns) {
  fns[key] = wrapSimpleFn(fns[key]);
}

fns.cond = async (options: EvalOptions, ...args: Expr[]) => {
  for (let i = 0; i * 2 < args.length; i++) {
    const predicate = args[i * 2];
    const handler = args[i * 2 + 1];
    if (await options.evalFn?.(predicate, options)) {
      return await options.evalFn?.(handler, options);
    }
  }
};

export default fns;
