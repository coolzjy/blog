---
title: 下一代模块打包工具 —— Rollup
date: 2016-08-06 22:30:00
---

为了完成越来越复杂的网页应用，模块化发挥了越来越重要的作用。为了让模块化代码在浏览器中运行，模块打包工具成为了开发者必不可少的重要工具。

<!--more-->

## 0 打包工具的前世今生

在 ES2015 发布之前，JavaScript 语言本身并不支持模块化，在众多的非官方模块化规范中，CommonJS 借势 Node.js 的流行成为了应用最为广泛的方案。然而，CommonJS 是为了构建浏览器之外的 JavaScript 项目而生的规范，想要在浏览器中运行 CommonJS 代码就必须对代码进行额外处理，这就是模块打包工具诞生的原因。

模块打包工具发展至今已经非常成熟，Browserify、Webpack 这些打包工具除了能够将 CommonJS 代码打包为浏览器可以运行的代码，还提供了代码分割、更多模块化规范支持等丰富的功能以及良好的开发体验。

CommonJS 的良好格局被 ES2015 模块化规范的出现打破了。原生的模块化规范相比第三方的模块化规范有许多无可取代的优势，可以确定的是 CommonJS 将会在不久的将来被 ES2015 所取代成为一段历史。而在 ES2015 普及的过程中，CommonJS 规范的模块打包工具可谓凭借 Babel 强行续命，发挥最后的余热。

## 1 「下一代」打包工具

Rollup 称自己为下一代打包工具，因为 Rollup 为 ES2015 模块化规范而生的。与当下流行的 CommonJS 打包规范打包工具不同，Rollup 可以直接打包符合 ES2015 模块化规范的代码，而并不需要将代码通过 Babel 转化为 CommonJS 模块化规范的形式。

## 2 为什么使用 Rollup

在目前 CommonJS 规范的打包工具拥有良好开发体验的情况下，为什么要使用 Rollup？或者说 Rollup 有什么优势？

首先，不同于目前流行的打包工具，Rollup 并不会为每个模块创建独立的函数作用域，而是将所有的代码放置于同一个作用域中，这使得代码的运行更有效率。

此外，得益于 ES2015 模块化规范的静态化导入特性，Rollup 可以通过 Tree-Shaking 操作对代码进行精简，从而得到提及更小的打包代码。关于 Tree-Shaking 的介绍，可以参考[这篇文章](/webpack-tree-shaking)。除了 Tree-Shaking，Rollup 还支持 Bindings 和 Cycles 这类高级特性。

最后，ES2015 已经是不可逆转的趋势，告别 Common Module，拥抱 ES Module 正在成为更多人的选择。

## 3 如何使用 Rollup

### 3.1 第一个 Rollup 打包文件

如果你熟悉 Browserify + Babel 或 Webpack + Babel 的开发模式，那么使用 Rollup 看起来再简单不过了，只需要使用 npm 全局安装 rollup，就可以通过命令行打包符合 ES2015 的文件了。

main.js:

```js
import config from "./config.js";

console.log(config.name);
```

config.js:

```js
export default {
  name: "Test Rollup",
  author: "Zhang",
};
```

只需要在命令行运行 `rollup main.js -o bundle.js` 就可以完成打包工作，其中 main.js 是入口文件，bundle.js 是输出文件，生成的打包文件将会是下面的样子：

bundle.js:

```js
var config = {
  name: "Test Rollup",
  author: "Zhang",
};

console.log(config.name);
```

可以看到 Rollup 生成的代码非常简洁，整个文件并没有添加额外的函数作用域及代码，这便是 Rollup 一大优势。

### 3.2 更多配置项

很多时候我们的代码还会作为一个模块导出供其他模块使用，Rollup 虽然是一个 ES2015 模块打包器，但提供多种规范的模块导出 —— Rollup 支持导出 AMD、CommonJS、ES2015、Global 及 UMD 五种规范的打包文件，可以通过 `rollup -f amd/cjs/es/iife/umd` 来切换导出模块所使用的规范。

在使用 Global 及 UMD 规范时，导出的模块可能会被挂载到全局变量上，这时需要设置一个变量名用于模块挂载，通过 `rollup -n` 命令就可以定义模块名。

Rollup 同样提供了配置文件的功能，使用 `rollup -c` 即可读取 rollup.config.js 中的配置。

## 4 Rollup 开发实践

### 4.1 Rollup 引用 npm 资源

使用 ES2015 模块语法的 Rollup 在默认情况下是不支持 CommonJS 模块，这还会导致 npm 包在默认情况下也不能被 Rollup 支持。为了使用 npm 资源，我们需要通过 plugin 帮助 Rollup 支持 CommonJS 模块语法，这里用到的是 rollup-plugin-commonjs，另外，由于 Rollup 默认不会解析 node_modules 目录，还需要使用 rollup-plugin-node-resolve 来解析 npm 模块。

### 4.2 Rollup 结合 Babel

默认情况下，Babel 会将 ES2015 模块语法转化为 CommonJS 模块语法，这必然会导致基于 ES2015 模块化语法的 Rollup 无法正常工作，因此 Babel 需要进行特殊配置以配合 Rollup。

为了使用 Babel，我们首先要将 Babel 默认的 es2015 preset 替换为 es2015-rollup，这一 preset 不会编译模块化的相关语法，另外还会添加 Rollup 的一些依赖代码。最后只需要在 Rollup 中使用 rollup-plugin-babel，就可以让 Babel 与 Rollup 和睦共处。
