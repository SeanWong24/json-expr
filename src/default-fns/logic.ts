import { evaluate, Expr, Scope, SimpleFn, wrapSimpleFn } from "../mod.ts";

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

fns.cond = async (scope: Scope) => {
  for (let i = 0; i * 2 < scope.args.length; i++) {
    const predicate = scope.args[i * 2];
    const handler = scope.args[i * 2 + 1];
    if (await evaluate(predicate, scope)) {
      return await evaluate(handler, scope);
    }
  }
};

export default fns;
