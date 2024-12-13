import { EvalOptions, Expr } from "../src/mod.ts";

export default {
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
    const handler = async (...args: unknown[]) => {
      return await options.evalFn?.(expr, {
        ...options,
        fns: {
          ...options.fns,
          args: () => args,
          arg: (i: number) => args[i],
        },
      });
    };
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
    await options.evalFn?.(expr, { ...options, basePath: resolvedPath });
  },
};
