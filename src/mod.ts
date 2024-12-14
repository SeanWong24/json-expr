export type Expr =
  | string
  | number
  | object
  | boolean
  | Expr[]
  | null
  | undefined
  | void;

// deno-lint-ignore no-explicit-any
export type SimpleFn = (...args: any[]) => Expr | Promise<Expr>;
export type Fn = (
  options: EvalOptions,
  // deno-lint-ignore no-explicit-any
  ...args: any[]
) => Expr | Promise<Expr>;
export type FnDict = Record<
  string,
  Fn
>;

export type EvalOptions = {
  evalFn?: EvalFn;
  fns: FnDict;
  basePath?: string;
  exprStack: Expr[];
};

export type EvalFn = (
  expr: Expr,
  options: EvalOptions,
) => Promise<Expr>;

export const wrapSimpleFn = (fn: SimpleFn) => {
  return async (options: EvalOptions, ...args: Expr[]) => {
    const evaluatedArgs = await Promise.all(
      args.map(async (arg) => await options.evalFn?.(arg, options)),
    );
    return await fn(...evaluatedArgs);
  };
};

export async function evaluateExpression(
  expr: Expr,
  options: EvalOptions,
): Promise<Expr> {
  const _options: EvalOptions = {
    ...options,
  };
  _options.exprStack = [expr, ..._options.exprStack];
  if (!Array.isArray(expr)) {
    return expr;
  }
  const [fnName, ...args] = expr;
  if (typeof fnName !== "string") {
    throw new Error(`${fnName} is expected to be a function name.`);
  }
  const fn = _options.fns?.[fnName];
  if (fn) {
    return await fn(_options, ...args) as Expr;
  }
  throw new Error(`${fnName} is not defined.`);
}

export class JsonEx {
  #fns: FnDict = {};

  addFns(fns: FnDict) {
    this.#fns = { ...this.#fns, ...fns };
    return this;
  }

  async eval(expr: Expr, options: Partial<EvalOptions> = {}) {
    return await evaluateExpression(expr, {
      exprStack: [],
      evalFn: evaluateExpression,
      fns: this.#fns ?? {},
      ...options,
    });
  }
}
