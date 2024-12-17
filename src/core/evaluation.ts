import { Scope } from "./scope.js";
import { Expr } from "./expr.js";

export async function evaluate(
  expr: Expr,
  scope: Scope,
): Promise<Expr> {
  if (!Array.isArray(expr)) {
    return expr;
  }
  const [fnName, ...args] = expr;
  if (typeof fnName !== "string") {
    throw new Error(
      `${JSON.stringify(fnName)} is expected to be a function name.`,
    );
  }
  const fn = scope.fns[fnName];
  if (!fn) {
    throw new Error(`${JSON.stringify(fnName)} is not defined.`);
  }
  return await fn(scope.createChild({ expr, args })) as Expr;
}
