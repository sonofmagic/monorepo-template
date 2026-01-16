---
outline: [2, 4]
---

# 什么是 npm 包

在 `Node.js` 中，**npm 包（npm package）** 是指一个通过 [npm（Node Package Manager）](https://www.npmjs.com/) 发布和管理的可重用 `JavaScript` 模块。它可以是一个库、工具、框架、命令行工具，甚至是一个完整的应用程序。

### 什么是 npm？

**npm（Node Package Manager）** 是 Node.js 的官方包管理工具，用于：

- 安装依赖库；
- 管理项目依赖；
- 发布自己的模块到 npm 生态。

命令行工具：`npm install`, `npm update`, `npm publish` 等。

同样 `yarn` / `pnpm` 也是 **npm（Node Package Manager）**，不过他们是非 `Nodejs` 官方的

他们的出现或多或少的解决了官方 `npm` 的很多问题，完全可以作为官方 `npm` 工具的平替，在社区里备受推崇，展现出 `Nodejs` 社区旺盛的生命力。

尤其是 `pnpm`，比官方 `npm` 好用太多，目前大家把很多对 `npm` 包管理器的期望都寄托在他身上。

> `pnpm` 对于 `Nodejs`，地位类似于 [`uv`](https://github.com/astral-sh/uv) 对于 `Python` 他们都不是官方项目，但是却逐渐成为了主流

<!-- `deno` / `bun` -->

---

### 什么是一个 npm 包？

一个 **npm 包** 通常具有以下结构：

```
my-package/
├── package.json     // 包的元数据（名字、版本、依赖等）
├── index.js         // 主文件（或其它入口）
└── lib/             // 模块代码
```

`package.json` 是核心文件，定义了：

- `name`：包的名称（唯一，不能与其它包冲突）
- `version`：版本号（如 `1.0.0`）
- `main`：主入口文件（默认是 `index.js`）
- `dependencies`：依赖的其他 npm 包
- `files`: 哪些文件应该被上传，用于忽略掉不需要的文件类型

> 更多字段，可以查看 [`configuring-npm/package-json`](https://docs.npmjs.com/cli/v11/configuring-npm/package-json)

### npm 包关系类型

#### **公共包**

来自 [npmjs.com](https://www.npmjs.com/) ，如 `lodash`, `react`, `axios`

[yarnpkg.com](https://yarnpkg.com/), [npmmirror(淘宝源)](https://npmmirror.com/) 这种本质上都是 [npmjs.com](https://www.npmjs.com/) 的镜像源，定期从 [npmjs.com](https://www.npmjs.com/) 同步包到他们的源上 (所以 `npmmirror` 有 `cnpm sync` 命令和 `同步功能` 就是为了在自动同步不及时的时候，手动同步的)

假如我们要发 **公共包**，那肯定把包发到 [npmjs.com](https://www.npmjs.com/) 上的，因为发其他公共源没有意义。

#### **私有包**

企业内部发布的包，需配置私有 `npm registry`。

注册源可以在用户本地 `User` 全局的 `.npmrc`, 或者是项目中的 `.npmrc` 进行配置

比如:

```txt
registry=https://registry.npmmirror.com/
@ice:registry=http://npm.icebreaker.top
```

就代表所有 `@ice/xxx` 这种包都从 `http://npm.icebreaker.top` 这里获取，其他包从 `https://registry.npmmirror.com/`

假如你不设置 `registry` 默认从最官方的源 `https://registry.npmjs.org/` 中获取包

假如你对 `npm私有源` 的搭建感兴趣，可以看看我写的这篇文章 [使用 Verdaccio 私有化 npm 源指南](https://juejin.cn/post/7357016488698839050)

#### **本地包**

可直接从 `文件夹`, `Git 仓库`, `monorepo workspace` 安装的包

因为其实我们在 `dependencies` 和 `devDependencies` 注册的包，协议可以是多种多样的，比如:

```jsonc
{
  "dependencies": {
    // npm 注册源上拿
    "foo": "1.0.0 - 2.9999.9999",
    "bar": ">=1.0.2 <2.1.2",
    "baz": ">1.0.2 <=2.3.4",
    "boo": "2.0.1",
    "qux": "<1.0.0 || >=2.3.1 <2.4.5 || >=2.5.2 <3.0.0",
    "til": "~1.2",
    "elf": "~1.2.3",
    "two": "2.x",
    "thr": "3.3.x",
    "lat": "latest",
    // http 协议拿
    "asd": "http://npmjs.com/example.tar.gz",
    // git 协议拿
    "xxx": "git+ssh://git@github.com:npm/cli#semver:^5.0",
    // 从 github 拿
    "express": "expressjs/express",
    "mocha": "mochajs/mocha#4727d357ea",
    "module": "npm/example-github-repo#feature/branch",
    // 本地文件协议拿
    "dyl": "file:../dyl",
    "kpg": "file:../foo/bar",
    // monorepo workspace
    "xya": "workspace:*"
  }
}
```

详见官方文档 [dependencies详解](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#dependencies)

### 注意点

值得注意的是，这个包的类型只和它的来源还有和当前包的关系有关，也就是说一个包，既可以是公共包，也可以是私有包，也可以是本地包。

比如在本 `monorepo` 中，`@icebraekers/monorepo` 是公共包，因为它已经发布到了 `https://www.npmjs.com` 上了

同时它也是一个本地包，因为本 `monorepo` 中，其他项目使用 `workspace` 的方式直接使用了这个包。

它也可以是一个私有包，比如你在公司内部网络，快速使用 [verdaccio](https://www.npmjs.com/package/verdaccio) 搭建一个私有源, 然后把 `@icebraekers/monorepo` 发布上去，那它就变成一个内网里的私有包了。

### 使用 npm 包的示例

这里我以一个最简单的一个 `cowsay` 包为例，这个包作用就是输出一个牛说话的字符画

- **安装第三方包：**

```bash
npm install cowsay
```

- **在代码中使用：**

```js
const cowsay = require('cowsay')

console.log(cowsay.say({
  text: '我爱中国!',
  e: 'oO',
  T: 'U '
}))
```

- **在 CLI 中使用 ：**

```bash
npx cowsay 我爱中国!
```

> `npx` 是 Node.js 提供的一个命令行工具，用来直接运行 npm 包，无需全局安装。

---

接下来，就让我们开始 `npm` 包的发布之旅吧
