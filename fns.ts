import { Expr } from "./mod.ts";

export const catalogue = {
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

export default {
  ...catalogue.types,
  ...catalogue.utils,
  ...catalogue.math,
  ...catalogue.logic,
};
