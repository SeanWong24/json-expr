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

There are two types of expression:

- **basic** expression (`string | number | boolean | object | null`)
- **functinal** expression (calling a function).

**Note that `Array` is not a basic expression type, since we use the array in
JSON as the syntax of a functional expression. An array may be created by call a
pre-defined array-creation function.**

When evaluating, a basic expression would result itself, yet a functional
expression would be further evaluated its result.

For a functional expression to be worked, the function needs to be defined
first. The pre-defined functions can be configured for each evaluator instance
created. If the default function set is loaded, it also provides a `def`
function that can be used to define custom functions using JSON.

### Default Functions

Check [`./src/default-fns`](./src/default-fns) for a set of default functions
that available to be loaded into the evaluator.

For the CLI usage, all these functions are loaded by default.

### Write the JSON

**Assuming the default functions are loaded into the evaluator.**

- For a basic expression, just simply put it as is.

  ```jsonc
  "foo"
  // evaluated value: "foo"
  ```

  ```jsonc
  3.1415926
  // evaluated value: 3.1415926
  ```

  ```jsonc
  true
  // evaluated value: true
  ```

  ```jsonc
  {
    "foo": "bar"
  }
  // evaluated value: { foo: 'bar' }
  ```

  ```jsonc
  null
  // evaluated value: null
  ```

  They would be evaluated as they are.

- For a functional expression, it should be surrounded by `[]`. Inside the `[]`,
  the first element should be the function name, then it is followed by the
  function arguments.

  ```jsonc
  ["add", 1, 1]
  // evaluated value: 2
  ```

  Functional expression can also be nested.

  ```jsonc
  ["add", ["mul", 2, 2], 1]
  // evaluated value: 5
  ```

- Some more examples with using default functions:
  - We can define a sequence of evaluation by using `$`, where its arguments are
    evaluated one by one in order. However, it would only return the last
    evaluated value.

    ```jsonc
    [
      "$",
      1,
      ["print", 2],
      3
    ]
    // 1 is discarded
    // it prints 2 as a side effect
    // evaluated value: 3
    ```

  - We can define a custom function by using `def`.

    ```jsonc
    [
      "$",
      [
        "def",
        "add_1",
        [
          "add",
          ["args", 0],
          1
        ]
      ],
      ["add_1", 1]
    ]
    // evaluated value: 2
    ```

  - We can skip a layer of evaluation by using `` ` ``, which maintains the
    structure of an array or an object but it evaluate the values of the inner
    elements.

    ```jsonc
    [
      "`",
      [0, 1, ["add", 0, 1]]
    ]
    /* evaluated value: [ 0, 1, 1 ] */
    ```

    ```jsonc
    [
      "`",
      {
        "foo": 1,
        "bar": ["add", 1, 1]
      }
    ]
    /* evaluated value: { foo: 1, bar: 2 } */
    ```
  - We can skip all inner evaluations by using `~`.

    ```jsonc
    [
      "`",
      [0, 1, ["add", 0, 1]]
    ]
    /* evaluated value: [0, 1, ["add", 0, 1]] */
    ```
    So yes, it could also be a way to create an array.

  - We can evaluate another JSON file by using `@`.

    Assuming we have this JSON file.

    ```jsonc
    // 1.json
    [
      "add",
      1,
      1
    ]
    ```
    In the same directory, we evaluate this file. It would give the result of
    `1.json`.

    ```jsonc
    // 2.json
    ["@", "./1.json"]
    /* evaluated value: 2 */
    ```

## Evaluator

### Evaluation

...

### Function Implementation

...

### CLI

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
