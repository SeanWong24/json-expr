import { evaluate, Expr, Scope, SimpleFn, wrapSimpleFn } from "../mod.js";

const defineFunctionInScope = (scope: Scope, distScope: Scope) => {
  const [name, expr] = scope.args as [
    name: string,
    expr: Expr,
  ];
  const handler = async (invokedScope: Scope) => {
    invokedScope.metadata.invokedArgs = await Promise.all(
      invokedScope.args.map(async (arg) => await evaluate(arg, invokedScope)),
    );
    return await wrapSimpleFn(async () => await evaluate(expr, invokedScope))(
      invokedScope,
    );
  };

  distScope.fns[name] = handler;
};

const fns: Record<string, SimpleFn> = {
  print: wrapSimpleFn(console.log),
  args: (scope: Scope) => {
    const index = scope.args[0];
    const invokedArgs = scope.metadata.invokedArgs as Expr[];
    if (typeof index === "number" && index >= 0) {
      return invokedArgs[index];
    }
    if (index == null) {
      return invokedArgs;
    }
    throw Error();
  },
  def: (scope: Scope) => {
    const distScope = scope.parent;
    if (!distScope) {
      throw Error();
    }
    defineFunctionInScope(scope, distScope);
  },
  gdef: (scope: Scope) => {
    const distScope = scope.root;
    if (!distScope) {
      throw Error();
    }
    defineFunctionInScope(scope, distScope);
  },
  $: async (scope: Scope) => {
    let result: Expr;
    for (const expr of scope.args) {
      result = await evaluate(expr, scope);
    }
    return result;
  },
  "@": async (scope: Scope) => {
    const jsonPath = scope.args[0];
    if (typeof jsonPath !== "string") {
      throw Error();
    }
    const basePath = scope.metadata.basePath;
    if (typeof basePath !== "string") {
      throw Error();
    }
    const resolvedPath = new URL(jsonPath, basePath).href;
    const expr = (await import(resolvedPath, {
      with: { type: "json" },
    })).default;
    scope.metadata.basePath = resolvedPath;
    return await evaluate(expr, scope);
  },
};

export default fns;
