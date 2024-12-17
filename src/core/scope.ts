import { FnDict } from "./fn.js";
import { Expr } from "./expr.js";

export type Metadata = Record<string, unknown>;

export class Scope {
  #fns: FnDict = {};
  #metadata: Metadata = {};

  parent?: Scope;
  expr?: Expr;
  args: Expr[] = [];

  get fns() {
    return new Proxy(this.#fns, {
      get: (target, name: string) => target[name] ?? this.parent?.fns[name],
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

  createChild(overrides: Partial<Omit<Scope, "parent">> & { expr: Expr }) {
    return new Scope({ ...overrides, parent: this });
  }

  constructor(
    overrides: Partial<Scope>,
  ) {
    Object.assign(this, overrides);
  }
}
