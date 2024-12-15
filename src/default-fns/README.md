# Default Functions

This is a list of default functions that are available to be loaded.

## Util

- `def`: It is used to define a custom function, where its first argument is the
  function name and the second argument is the function body.
- `gdef`: It is similar to `def` but it would define the function in the global
  scope.
- `args`: It can be used inside a defined function body, which returns the list
  of arguments that passed into the defined function when it is called. If a
  `index` argument is given to the `args` function, it returns the specific
  argument at that index instead.
- `$`: It is used to define a sequence of expressions, which evaluates its
  arguments one by one and return the last evaluated value.
- `@`: It is used to evaluate another JSON file, which is useful to split logic
  into different files.
- `` ` ``: It is used to skip one layer of evaluation.
- `~`: It is used to skip all inner evaluation.

## Logic

- `cond`: It is used to define conditional branches, which takes a even number
  of arguments. The odd number of arguments are to be evaulated as a boolean
  value, the even number of arguments are the branch to be chosen if the
  previous argument is evaluated as `true`. If an argument is evaluated as
  `false`, it skips the next argument and continue to evaluate the next
  argument.
- `eq`
- `se`
- `ne`
- `nse`
- `gt`
- `lt`
- `gte`
- `lte`
- `and`
- `or`
- `not`

## Data

- `str`: It is used to create a `string`.
- `int`: It is used to create an `int`.
- `float`: It is used to create a `float`.
- `arr`: It is used to create an `array`.
- `get`: It is used to get the element of an object or an arrray at the given
  index, where its first argument is the index to query and the second arggument
  is the object or array.
- `set`: It is used to set the element of an object or an arrray at the given
  index, where its first argument is the index to query, the second argument is
  the value to be set, and the third arggument is the object or array.
- `len`: It is used to get the length of an array or a string.

## Math

- `neg`
- `add`
- `sub`
- `mul`
- `div`
- `pow`
- `mod`
