# TypeScript Packages

Use TypeScript to validate source and to publish a precise consumer contract.

Keep the source typecheck separate from artifact generation, enable strict settings appropriate for libraries, and avoid path aliases that cannot be resolved by consumers. Vue packages should run `vue-tsc`; non-Vue TypeScript packages should run `tsc`.

Public type behavior belongs in `tsd` tests. Runtime tests should import built output so module resolution matches delivery.
