# JsonEx

JsonEx is a JSON-based customizable expression syntax that allows you to define
and execute logic securely. By controlling the set of available built-in
functions, it provides the flexibility for a wide range of tasks, from simple
calculations to more advanced logic, all within a safe execution environment.

JsonEx enables secure dynamic logic for use cases like automation,
configuration, and rule execution. Its customizable function set allows for
flexible, condition-driven logic tailored to the application’s needs.

## Syntax

### Expression

An expression can be a basic expression (`string | number | boolean | null`) or
a functinal expression (calling a function).

When evaluating, a basic expression would result itself, yet a functional
expression would be further evaluated its result.

### Write the JSON

For a basic expression, just simply put it as is.

```jsonc
"foo"
/* evaluated value: "foo" */
```

```jsonc
3.1415926
/* evaluated value: 3.1415926 */
```

```jsonc
true
/* evaluated value: true */
```

```jsonc
null
/* evaluated value: null */
```

They would be evaluated as they are.

For a functional expression, it should be surrounded by `[]`. Inside the `[]`,
the first element should be the function name, then it is followed by the
function arguments.

```jsonc
["add", 1, 1]
/* evaluated value: 2 */
```

Functional expression can also be nested.

```jsonc
["add", ["mul", 2, 2], 1]
/* evaluated value: 5 */
```

### Default Functions

Check [`./src/default-fns`](./src/default-fns) for a set of default functions
that available to be loaded into the evaluator.

For the CLI usage, all these functions are loaded by default.

## Try it out

The evaluator can be run by either

- clone the repo and run

  ```sh
  npm run cli
  ```

For example, to evaluate
[`./examples/fibonacci/main.json`](./examples/fibonacci/main.json) with default
function set:

```sh
npm run cli ./examples/fibonacci/main.json
```
