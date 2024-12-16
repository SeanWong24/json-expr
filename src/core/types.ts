import { Scope } from "./scope.js";

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

export type EvalFn = (
  expr: Expr,
  options: Scope,
) => Promise<Expr>;
