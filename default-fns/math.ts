import { SimpleFn, wrapSimpleFn } from "../src/mod.ts";

const fns: Record<string, SimpleFn> = {
  neg: (x: number) => -x,
  add: (a: number, b: number) => a + b,
  sub: (a: number, b: number) => a - b,
  mul: (a: number, b: number) => a * b,
  div: (a: number, b: number) => a / b,
  pow: (a: number, b: number) => a ** b,
  mod: (a: number, b: number) => a % b,
};

for (const key in fns) {
  fns[key] = wrapSimpleFn(fns[key]);
}

export default fns;
