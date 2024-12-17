import { evaluate } from "./evaluation.js";
import { FnDict } from "./fn.js";
import { Metadata, Scope } from "./scope.js";
import { Expr } from "./expr.js";

export class Evaluator {
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

export default Evaluator;
