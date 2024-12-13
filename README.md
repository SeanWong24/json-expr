# JsonEx

JsonEx is a customizable expression syntax that allows you to define and execute
logic securely. By controlling the set of available built-in functions, it
provides the flexibility for a wide range of tasks, from simple calculations to
more advanced logic, all within a safe execution environment.

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

```json
"foo"
```

```json
3.1415826
```

```json
true
```

```json
null
```

They would be evaluated as they are.

For a functional expression, it should be surrounded by `[]`. Inside the `[]`,
the first element should be the function name, then it is followed by the
function arguments.

```json
["add", 1, 1]
/* evaluated value: 2 */
```

### Built-in Functions

A set of built-in functions are provided and can be loaded into the evaluator.

- types
  - str
  - int
  - float
  - arr
  - get
  - set
  - len
- utils
  - print
  - input
- math
  - neg
  - add
  - sub
  - mul
  - div
  - pow
  - mod
- logic
  - eq
  - se
  - ne
  - nse
  - gt
  - lt
  - gte
  - lte
  - and
  - or
  - not

### Special Functions

- Use `cond` function to define logic branches.
- Use `def` function to define a custom function, inside the defined function
  body, `arg` function is provided, which takes a number as argument and returns
  the arguments passed into the defined function.
- Use `$` function to define a sequence of expressions, which evaluates its
  arguments one by one and return the last evaluated value.
- Use `@` function to run another JSON file, which is useful to load custom
  functions in another file.

## Usage (with Deno)

The evaluator can be run by either

- clone the repo and run

  ```sh
  deno run -A mod.ts <json-file-to-be-evaluated>
  ```

- or directly run with the URL

  ```sh
  deno run -A https://raw.githubusercontent.com/SeanWong24/json-ex/refs/heads/main/mod.ts <json-file-to-be-evaluated>
  ```

For example, to evaluate
[`./examples/fibonacci/main.json`](./examples/fibonacci/main.json):

```sh
deno run -A mod.ts ./examples/fibonacci/main.json
```
