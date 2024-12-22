# JSON-X

JSON-X is a JSON-based customizable expression syntax that allows you to define
and execute logic securely. By controlling the set of available pre-defined
functions, it provides the flexibility for a wide range of tasks, from simple
calculations to more advanced logic.

It enables secure dynamic logic for use cases like automation, configuration,
and rule execution. Its customizable function set allows for flexible,
condition-driven logic tailored to the application’s needs.

## Play with It

[Playground](https://seanwong24.github.io/json-x)

## Syntax

### Expression

There are two types of expression:

- **basic** expression (`string | number | boolean | object | null`)
- **functinal** expression (calling a function).

**Note that `Array` is not a basic expression type, since it is already been
used as the syntax of a functional expression. An array may be created by call a
pre-defined array-creation function.**

When evaluating, a basic expression would result itself, yet a functional
expression would be further evaluated for its result.

For a functional expression to be worked, the function needs to be defined
first. The pre-defined functions can be configured for each evaluator instance
created. A default set of pre-defined functions is provided to be potentially
loaded into the evaluator. If the default function set is loaded, it also
provides a `def` function that can be used to define custom functions using
JSON.

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
      "~",
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

### Installation

```sh
npm i @seanwong24/json-x
```

### Evaluation

```ts
// the default pre-defined function set can be imported as `DEFAULT_FNS`
// it is an object with string as key and JSON_X compatible function as value
import Evaluator, { DEFAULT_FNS } from "@seanwong24/json-x";

// create an evaluator instance
const evaluator = new Evaluator();

// load the default functions, which can also be a custom set of functions
// it should be an object with string as key and JSON_X compatible function as value
// this method can be called multiple times, the later loaded functions might override the previous if two functions has the same name
evaluator.addFns(DEFAULT_FNS);

// obtain the JSON object to be evaluated
const json = ["add", 1, 1];

// evaulate and get the result
const result = await evaluator.eval(json);

// optionally print out the result
console.log(result);
// it prints: 2
```

### Security and Controllability

Since it requires to load a set of functions to be used for the evaluation, we
have full control of how powerful and safe the evaluation environment could be.
By loading different set of pre-defined function for each specific case, we can
provide different feature and different permission level. If nothing is provided
as the pre-defined functions, it basically can do no functional evaluation at
all.

For example, if we only provide `def`, `add` and `neg` as the pre-defined
function set, the user might be able to achieve `sub` like this below. However,
they would not be able to access anything more than what we provided like
console access or file access. If we do not provide `def`, the user cannot even
define a custom function.

```jsonc
[
  "$",
  ["def", "sub", ["add", ["args", 0], ["neg", ["args", 1]]]],
  ["sub", 2, 1]
]
/* evaluated value: 2 */
```

Sometimes, we might want to give some more abilities in a specific use case. For
example, we can implement and provide a `cmd_args` function that allowing users
to obtain the arguments passed from the command line. So the user might be able
to achieve something like below.

```jsonc
// assuming the command args are: ["http://localhost", 8080]
[
  "`",
  {
    "appName": "Foo",
    "url": ["add", ["cmd_args", 0], ["add", ":", ["cmd_args", 1]]]
  }
]
// evaluated value: { appName: 'Foo', url: 'http://localhost:8000' }
```

### Function Implementation

The pre-defined functions are implemented as a specific type
[`Fn`](./src/core/fn.ts), which takes a [`Scope`](./src/core/scope.ts) object as
argument and returns a [`Expr | Promise<Expr>`](./src/core/expr.ts). The result
would always be awaited.

By taking the `Scope` arugment, the function can have control of the evaluation
such as whether to evaluation the inner expression and setting some metadata.

The more common cases might not need to have control of the evaluation. In such
cases, a "simple function" can be implemented, which simply takes some
arguments, returns something, and nothing more. For example, an `add` function
might be implemented as a "simple function" like `(x, y) => x + y`, which takes
two arguments and adds them together. To make a "simple function" JSON-X
compatible, a `wrapSimpleFn` helper function is provided, which takes a "simple
function" as arugment and returns a JSON-X compatible function. Internally, it
evaluates all arugments that would be received by the "simple function" before
passing them into the simple function. Most of the default functions are
implemented using this way.

### CLI

The evaluator can be run by either

- run remotely
  ```sh
  npx @seanwong24/json-x
  ```
- install the package and then run locally

  ```sh
  npx json-x
  ```

For example, to evaluate
[`./examples/fibonacci/main.x.json`](./examples/fibonacci/main.x.json) with
default function set:

```sh
npx json-x ./examples/fibonacci/main.x.json
```
