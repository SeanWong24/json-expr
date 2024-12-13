export type Expr =
  | string
  | number
  | object
  | boolean
  | Expr[]
  | null
  | undefined;

// deno-lint-ignore ban-types
export type Fns = Record<string, Function>;

export type EvalOptions = {
  evalFn?: EvalFn;
  coreFns: Fns;
  fns: Fns;
  basePath: string;
};

export type EvalFn = (
  expr: Expr,
  options?: Partial<EvalOptions>,
) => Promise<Expr>;

export class JsonEx {
  #coreFns: Fns = {};
  #normalFns: Fns = {};

  addCoreFns(fns: Fns) {
    this.#coreFns = { ...this.#coreFns, ...fns };
    return this;
  }

  addFns(fns: Fns) {
    this.#normalFns = { ...this.#normalFns, ...fns };
    return this;
  }

  async eval(expr: Expr, options: Partial<EvalOptions> = {}): Promise<Expr> {
    if (!Array.isArray(expr)) {
      return expr;
    }
    if (!options.evalFn) {
      options.evalFn = this.eval;
    }
    if (!options.coreFns) {
      options.coreFns = this.#coreFns;
    }
    if (!options.fns) {
      options.fns = this.#normalFns;
    }
    const [fnName, ...args] = expr;
    if (typeof fnName !== "string") {
      throw new Error(`${fnName} is expected to be a function name.`);
    }
    // deno-lint-ignore ban-types
    let fn: Function | undefined = void 0;
    fn = options.coreFns?.[fnName];
    if (fn) {
      return await fn(options, ...args);
    }
    fn = options.fns?.[fnName];
    if (fn) {
      return await fn(
        ...await Promise.all(
          args.map(async (arg) => await options.evalFn?.(arg, options)),
        ),
      );
    }
    throw new Error(`${fnName} is not defined.`);
  }
}
