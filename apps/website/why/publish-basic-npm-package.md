# 如何发布 npm 包

其实发布基础的 `npm` 包非常非常简单

## 创建目录

随便创建一个目录，在创建目录之后执行 `npm init` 输入一些你的包的元数据之后，一个 `package.json` 就被创建了出来

假如你懒得写，那就执行 `npm init -y` ，反正后续都是可以更改的，此时你得到的 `package.json` 如下

```jsonc
{
  "name": "icebreaker-npm-basic-package",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "description": ""
}
```

> 你操作到这里，`package.json` 的 `name` 一定要换成你自己的，因为这个包我已经发布了，所以名字已经被我占据了你用不了

## 创建一个 `index.js`

在你的 `package.json` 同目录下创建一个 `index.js`，内容如下

```js
console.log(`load ${__filename}`)

function sayHello() {
  console.log('hello world')
}

module.exports = {
  sayHello
}
```

> 按照现代包的要求，其实是优先 esm 格式的，但是上面的例子还是用的 cjs，这个会在下个章节提到

## 发包到 npmjs

然后你在 `package.json` 同级目录下，执行 `npm publish`

然后恭喜你，你失败了！

为什么失败？你连 `npmjs` 账号都还没有注册呢！

执行 `npm publish` 是需要先 `npm login` 登录你的 `npmjs` 账号的

赶紧去 [`www.npmjs.com`](https://www.npmjs.com/) 右上角注册一个账号吧！

## 获取 Access Token

注册好一个账号之后，再执行 `npm login`, 你就可以在弹出来的页面中，登录你的账号

登录成功之后，默认情况下，他会给你去生成一个 `Access Token` 作为你的发包凭证

此时会写入到你全局 `.npmrc` 的文件中，类似于下面一行

```txt
registry.npmjs.org/:_authToken=npm_hashhashhashhashhashhashhashhashhash
```

假如这一行存在，说明你本地的 `npm Access Token` 就设置好了，然后你才有发包的权限。

> 你也可以在 `https://www.npmjs.com/settings/<你的用户名>/tokens` 中管理你的 `token`，给不同的 `token` 设置不同的作用域，有效期和 `ip` 限制，帮助你适配正常开发，`CI/CD`，`Token` 分发的各种场景

同样发私有源包也是同理:

```txt
//npm.icebreaker.top/:_authToken=npm_hashhashhashhashhashhashhashhashhash
```

你必须有这个凭证，你才有这个权限。

## 成功发包

配置好 `npm Access Token` 执行 `npm publish` 然后就能发包成功了

```sh
npm notice
npm notice 📦  icebreaker-npm-basic-package@1.0.0
npm notice Tarball Contents
npm notice 120B index.js
npm notice 187B package.json
npm notice Tarball Details
npm notice name: icebreaker-npm-basic-package
npm notice version: 1.0.0
npm notice filename: icebreaker-npm-basic-package-1.0.0.tgz
npm notice package size: 326 B
npm notice unpacked size: 307 B
npm notice shasum: fc4624e7bddd96a6ffac505f672b62de55898d6b
npm notice integrity: sha512-2UtWkYX5tEUyu[...]ZFF64Wvq+Vw0Q==
npm notice total files: 2
npm notice
npm notice Publishing to https://registry.npmjs.org/ with tag latest and default access
+ icebreaker-npm-basic-package@1.0.0
```

然后你就发现你的包可以通过访问 `https://www.npmjs.com/package/<你的包名>` 获取到了

比如我这个包就能通过 `https://www.npmjs.com/package/icebreaker-npm-basic-package` 直接访问

## 安装调用

你可以执行 `npm i <你的包名>` 直接获取到你的包，进行调用了。

> 假如你没有使用官方的 `registry.npmjs.org`，反而使用的是 `npmmirror.com` 这种国内的淘宝镜像源，那么你的包同步到国内镜像源，可能需要一段时间
>
> 你可以通过 `npm i -g cnpm`, `cnpm sync <你的包名>` 进行手动同步，加快这个流程。

安装好之后，使用 `nodejs` 执行代码:

```js
const { sayHello } = require('icebreaker-npm-basic-package')

sayHello()
```

出现

```txt
load /your/path/to/node_modules/icebreaker-npm-basic-package/index.js
hello world
```

证明你安装调用成功了！实际上很简单吧！

## 更进一步

恭喜你，你已经踏出了你的第一步，你已经来到了 `Nodejs` 这座高山的山脚下准备进行攀登。

山上云雾缭绕，看不到顶，攀登的路上, 险象环生，爬的越高越感觉举步维艰。

但是也用不着害怕，正如荀子在《劝学》篇所写下的: `不积跬步,无以至千里。不积小流,无以成江海`。

量变促成质变，等你到达那个质变的点，你就会发现自己看待代码的眼光已经完全改变了，从新的角度去看，很容易一眼看出问题的本质。

所以，多看优秀的代码，多去调试开源项目的源代码，多写代码多思考，你就成长了！

接下来让我们改进一下这个包，让他更加的现代化。
