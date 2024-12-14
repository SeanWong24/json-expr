export type Expr =
  | string
  | number
  | object
  | boolean
  | Expr[]
  | null
  | undefined;

// deno-lint-ignore no-explicit-any
export type SimpleFn = (...args: any[]) => unknown | Promise<unknown>;
export type Fn = (
  options: EvalOptions,
  // deno-lint-ignore no-explicit-any
  ...args: any[]
) => unknown | Promise<unknown>;
export type FnDict = Record<
  string,
  Fn
>;

export type EvalOptions = {
  evalFn?: EvalFn;
  fns: FnDict;
  basePath: string;
};

export type EvalFn = (
  expr: Expr,
  options?: Partial<EvalOptions>,
) => Promise<Expr>;

export const wrapSimpleFn = (fn: SimpleFn) => {
  return async (options: EvalOptions, ...args: Expr[]) => {
    const evaluatedArgs = await Promise.all(
      args.map(async (arg) => await options.evalFn?.(arg, options)),
    );
    return await fn(...evaluatedArgs);
  };
};

export class JsonEx {
  #fns: FnDict = {};

  addFns(fns: FnDict) {
    this.#fns = { ...this.#fns, ...fns };
    return this;
  }

  async eval(expr: Expr, options: Partial<EvalOptions> = {}): Promise<Expr> {
    if (!Array.isArray(expr)) {
      return expr;
    }
    if (!options.evalFn) {
      options.evalFn = this.eval;
    }
    if (!options.fns) {
      options.fns = this.#fns;
    }
    const [fnName, ...args] = expr;
    if (typeof fnName !== "string") {
      throw new Error(`${fnName} is expected to be a function name.`);
    }
    // deno-lint-ignore ban-types
    let fn: Function | undefined = void 0;
    fn = options.fns?.[fnName];
    if (fn) {
      return await fn(options, ...args);
    }
    throw new Error(`${fnName} is not defined.`);
  }
}
