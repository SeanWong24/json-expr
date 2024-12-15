import { Expr, SimpleFn, wrapSimpleFn } from "../mod.js";

const fns: Record<string, SimpleFn> = {
  str: (v: unknown) => v?.toString() ?? "",
  int: (v: string) => Number.parseInt(v),
  float: (v: string) => Number.parseFloat(v),
  arr: (...args: unknown[]) => args,
  get: (i: string | number, obj: Record<string | number, Expr>) => obj?.[i],
  set: (
    i: string | number,
    v: unknown,
    obj: Record<string | number, unknown>,
  ) => {
    obj && (obj[i] = v);
  },
  len: (v: string | Array<number>) => v.length,
};

for (const key in fns) {
  fns[key] = wrapSimpleFn(fns[key]);
}

export default fns;
