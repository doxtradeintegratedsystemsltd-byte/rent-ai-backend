/**
 * Utility type to recursively expand a type definition.
 *
 * This type is particularly useful for expanding nested types in order to view
 * all their keys in VS Code IntelliSense. By using this utility, you can get a
 * more detailed view of the structure of complex types.
 *
 * For Best usage, use in conjuction with the ts-type-expand extension to copy the type
 *
 * Usage:
 *
 * ```typescript
 * type MyType = {
 *   a: {
 *     b: {
 *       c: string;
 *     };
 *   };
 * };
 *
 * type ExpandedType = Expand<MyType>;
 * ```
 *
 * In the example above, `ExpandedType` will now display all the nested keys of `MyType`
 * in VS Code IntelliSense, making it easier to work with deeply nested structures.
 *
 * @template T - The type to be expanded.
 */
export type Expand<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: Expand<O[K]> }
    : never
  : T;

// Example usage:
// type ExpandedType = Expand<TypeToExpand>;
