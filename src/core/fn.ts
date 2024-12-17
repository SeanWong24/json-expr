import { evaluate } from "../mod.js";
import { Scope } from "./scope.js";
import { Expr } from "./expr.js";

// deno-lint-ignore no-explicit-any
export type SimpleFn = (...args: any[]) => Expr | Promise<Expr>;
export type Fn = (scope: Scope) => Expr | Promise<Expr>;
export type FnDict = Record<
  string,
  Fn
>;

export const wrapSimpleFn = (fn: SimpleFn) => {
  return async (scope: Scope) => {
    const evaluatedArgs = await Promise.all(
      scope.args.map(async (arg) => await evaluate(arg, scope)),
    );
    return await fn(...evaluatedArgs);
  };
};
