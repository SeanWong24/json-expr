import { evaluate } from "./evaluation.js";
import { Scope } from "./scope.js";
import { SimpleFn } from "./types.js";

export const wrapSimpleFn = (fn: SimpleFn) => {
  return async (scope: Scope) => {
    const evaluatedArgs = await Promise.all(
      scope.args.map(async (arg) => await evaluate(arg, scope)),
    );
    return await fn(...evaluatedArgs);
  };
};
