import { EvalOptions, Expr, SimpleFn, wrapSimpleFn } from "../mod.ts";

const fns: Record<string, SimpleFn> = {
  print: wrapSimpleFn(console.log),
  def: (options: EvalOptions, name: string, expr: Expr) => {
    const handler = wrapSimpleFn(async (...args: unknown[]) =>
      await options.evalFn?.(expr, {
        ...options,
        fns: {
          ...options.fns,
          args: (_, i: number) => (i >= 0 ? args[i] : args) as Expr,
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

export default fns;
