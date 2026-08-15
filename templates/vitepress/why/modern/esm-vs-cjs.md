# ESM vs CommonJS

ES modules are the preferred format for new packages. CommonJS remains relevant when consumers or toolchains still require `require()`.

Choose ESM-only when your supported runtime matrix allows it. Publish dual formats only when the compatibility benefit justifies duplicate builds and interop testing.

For dual packages, map `import`, `require`, and `types` conditions explicitly and test each consumer path. Avoid exporting different logical module instances from the two formats.
