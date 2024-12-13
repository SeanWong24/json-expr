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

export const JSONExpFns = {
  types: {
    str: (v: unknown) => v?.toString() ?? "",
    int: (v: string) => Number.parseInt(v),
    float: (v: string) => Number.parseFloat(v),
    arr: (...args: unknown[]) => args,
    get: (i: string | number, obj: Record<string | number, unknown>) =>
      obj?.[i],
    set: (
      i: string | number,
      v: unknown,
      obj: Record<string | number, unknown>,
    ) => obj && (obj[i] = v),
    len: (v: string | Array<number>) => v.length,
  },
  utils: {
    print: console.log,
    input: prompt,
  },
  math: {
    neg: (x: number) => -x,
    add: (a: number, b: number) => a + b,
    sub: (a: number, b: number) => a - b,
    mul: (a: number, b: number) => a * b,
    div: (a: number, b: number) => a / b,
    pow: (a: number, b: number) => a ** b,
    mod: (a: number, b: number) => a % b,
  },
  logic: {
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
  },
  get ALL() {
    return { ...this.types, ...this.utils, ...this.math, ...this.logic };
  },
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

if (import.meta.main) {
  const jsonPath = Deno.args[0] ?? "./examples/factorial/main.json";
  if (!jsonPath) {
    console.log(`Usage: json-ex <JOSN_FILE_PATH>`);
    Deno.exit();
  }
  const resolvedPath = new URL(jsonPath, `file://${Deno.cwd()}/`).href;
  const expr: Expr =
    (await import(resolvedPath, { with: { type: "json" } })).default;
  const jsonEx = new JsonEx().addFns(JSONExpFns.ALL);
  const value = await jsonEx.eval(expr, { basePath: resolvedPath });
  console.info("evaluated value:", value);
}
