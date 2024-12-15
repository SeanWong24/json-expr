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
export type Fn = (scope: Scope) => Expr | Promise<Expr>;
export type FnDict = Record<
  string,
  Fn
>;

export type Metadata = Record<string, unknown>;

export class Scope {
  #fns: FnDict = {};
  #metadata: Metadata = {};

  parent?: Scope;
  expr?: Expr;
  basePath?: string;
  args: Expr[] = [];

  get fns() {
    return new Proxy(this.#fns, {
      get: (target, name: string) => target[name] ?? this.parent?.getFn(name),
    });
  }
  set fns(value: FnDict) {
    this.#fns = value;
  }

  get metadata() {
    return new Proxy(this.#metadata, {
      get: (target, name: string) =>
        target[name] ??
          this.parent?.metadata[name],
    });
  }
  set metadata(value: Metadata) {
    this.#metadata = value;
  }

  get root(): Scope {
    if (!this.parent) {
      return this;
    }
    return this.parent.root;
  }

  getFn(name: string): Fn | undefined {
    return this.fns[name] ?? this.parent?.getFn(name);
  }

  getBasePath(): string | undefined {
    return this.basePath ?? this.parent?.getBasePath();
  }

  createChild(overrides: Partial<Omit<Scope, "parent">> & { expr: Expr }) {
    return new Scope({ ...overrides, parent: this });
  }

  constructor(
    overrides: Partial<Scope>,
  ) {
    Object.assign(this, overrides);
  }
}

export type EvalFn = (
  expr: Expr,
  options: Scope,
) => Promise<Expr>;

export const wrapSimpleFn = (fn: SimpleFn) => {
  return async (scope: Scope) => {
    const evaluatedArgs = await Promise.all(
      scope.args.map(async (arg) => await evaluate(arg, scope)),
    );
    return await fn(...evaluatedArgs);
  };
};

export async function evaluate(
  expr: Expr,
  scope: Scope,
): Promise<Expr> {
  if (!Array.isArray(expr)) {
    return expr;
  }
  const [fnName, ...args] = expr;
  if (typeof fnName !== "string") {
    throw new Error(
      `${JSON.stringify(fnName)} is expected to be a function name.`,
    );
  }
  const fn = scope.fns[fnName];
  if (!fn) {
    throw new Error(`${JSON.stringify(fnName)} is not defined.`);
  }
  return await fn(scope.createChild({ expr, args })) as Expr;
}

export class JsonEx {
  #fns: FnDict = {};

  addFns(fns: FnDict) {
    this.#fns = { ...this.#fns, ...fns };
    return this;
  }

  async eval(expr: Expr, metadata: Metadata = {}) {
    return await evaluate(
      expr,
      new Scope({
        fns: this.#fns ?? {},
        metadata,
      }),
    );
  }
}
