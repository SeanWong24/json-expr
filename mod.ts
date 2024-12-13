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

type EvalOptions = {
  fns: Fns;
  basePath: string;
};

export class JsonEx {
  #coreFns: Fns = {
    cond: async (options: EvalOptions, ...args: Expr[]) => {
      for (let i = 0; i * 2 < args.length; i++) {
        const predicate = args[i * 2];
        const handler = args[i * 2 + 1];
        if (await this.eval(predicate, options)) {
          return await this.eval(handler, options);
        }
      }
    },
    def: (options: EvalOptions, name: string, expr: Expr) => {
      const handler = async (...args: unknown[]) => {
        return await this.eval(expr, {
          ...options,
          fns: {
            ...options.fns,
            args: () => args,
            arg: (i: number) => args[i],
          },
        });
      };
      this.#normalFns[name] = handler;
    },
    $: async (options: EvalOptions, ...body: Expr[]) => {
      let result: Expr = void 0;
      for (const expr of body) {
        result = await this.eval(expr, options);
      }
      return result;
    },
    "@": async (options: EvalOptions, jsonPath: string) => {
      const resolvedPath = new URL(jsonPath, options.basePath).href;
      const expr = (await import(resolvedPath, {
        with: { type: "json" },
      })).default;
      await this.eval(expr, { ...options, basePath: resolvedPath });
    },
  };
  #normalFns: Fns = {};

  addFns(fns: Fns) {
    this.#normalFns = { ...this.#normalFns, ...fns };
    return this;
  }

  async eval(expr: Expr, options: Partial<EvalOptions> = {}): Promise<Expr> {
    if (!Array.isArray(expr)) {
      return expr;
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
    fn = this.#coreFns[fnName];
    if (fn) {
      return await fn(options, ...args);
    }
    const fns = options.fns ?? this.#normalFns;
    fn = fns[fnName];
    if (fn) {
      return await fn(
        ...await Promise.all(
          args.map(async (arg) => await this.eval(arg, options)),
        ),
      );
    }
    throw new Error(`${fnName} is not defined.`);
  }
}
