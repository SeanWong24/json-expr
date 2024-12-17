export type Expr =
  | string
  | number
  | object
  | boolean
  | Expr[]
  | null
  | undefined
  | void;
