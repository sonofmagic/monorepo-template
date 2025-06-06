# 改进并发布现代 npm 包

##

在 `esm` 格式中的 `js` 中使用 `require` 会报错

```sh
ReferenceError: require is not defined in ES module scope, you can use import instead
```

另外也有一种邪道做法，适用于 `nodejs`:

```js
import { createRequire } from 'node:module'

const require = createRequire(import.meta.filename)

const { sayHello } = require('icebreaker-npm-basic-package')

sayHello()
```
