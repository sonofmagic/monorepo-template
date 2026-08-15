# Type Declarations

Type declarations are part of a TypeScript package's public API.

Generate `.d.ts` files from the same source revision as runtime output, point `types` and export conditions at files included in the tarball, and use `tsd` tests for important inference and error behavior.

Declaration bundling can simplify public output, but it must preserve module augmentation, generics, and referenced types. Always inspect the packed artifact rather than testing source imports alone.
