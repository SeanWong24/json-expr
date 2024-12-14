import { EvalOptions, Expr, SimpleFn, wrapSimpleFn } from "../src/mod.ts";

const catalogue: Record<string, Record<string, SimpleFn>> = {
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
};

for (const category of Object.values(catalogue)) {
  for (const key in category) {
    category[key] = wrapSimpleFn(category[key]);
  }
}

const specialFns = {
  cond: async (options: EvalOptions, ...args: Expr[]) => {
    for (let i = 0; i * 2 < args.length; i++) {
      const predicate = args[i * 2];
      const handler = args[i * 2 + 1];
      if (await options.evalFn?.(predicate, options)) {
        return await options.evalFn?.(handler, options);
      }
    }
  },
  def: (options: EvalOptions, name: string, expr: Expr) => {
    const handler = wrapSimpleFn(async (...args: unknown[]) =>
      await options.evalFn?.(expr, {
        ...options,
        fns: {
          ...options.fns,
          args: () => args,
          arg: (_, i: number) => args[i],
        },
      })
    );
    options.fns[name] = handler;
  },
  $: async (options: EvalOptions, ...body: Expr[]) => {
    let result: Expr = void 0;
    for (const expr of body) {
      result = await options.evalFn?.(expr, options);
    }
    return result;
  },
  "@": async (options: EvalOptions, jsonPath: string) => {
    const resolvedPath = new URL(jsonPath, options.basePath).href;
    const expr = (await import(resolvedPath, {
      with: { type: "json" },
    })).default;
    return await options.evalFn?.(expr, { ...options, basePath: resolvedPath });
  },
};

export default {
  ...specialFns,
  ...catalogue.types,
  ...catalogue.utils,
  ...catalogue.math,
  ...catalogue.logic,
};
