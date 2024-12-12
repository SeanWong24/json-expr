# A JSON-based Expression Syntax and the Evaluator

## Usage (with Deno)

The evaluator can be run by either

- clone the repo and run

  ```sh
  deno run -A mod.ts <json-file-to-be-evaluated>
  ```

- or directly run with the URL

  ```sh
  deno run -A https://raw.githubusercontent.com/SeanWong24/json-exp/refs/heads/main/mod.ts <json-file-to-be-evaluated>
  ```

For example, to evaluate
[`./examples/fibonacci/main.json`](./examples/fibonacci/main.json):

```sh
deno run -A mod.ts ./examples/fibonacci/main.json
```
