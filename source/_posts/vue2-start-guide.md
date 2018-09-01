---
title: "[译] Vue 2.0 RC 入门指南"
date: 2016-09-20 21:00:00
---

> 原文链接: [https://github.com/vuejs/vue/wiki/Vue-2.0-RC-Starter-Resources](https://github.com/vuejs/vue/wiki/Vue-2.0-RC-Starter-Resources)
> 校对：[Kathy](https://segmentfault.com/u/kathy_miao)

# 简介

激动人心的时刻！Vue 2.0 目前来到了 RC 阶段，并且支持库 vuex、vue-router，以及构建工具 vueify 和 vue-loader 都已经提供了支持 2.0 的预览版本！vue-cli 也在今天提供了 2.0 的简单模版！

尽管我们还在准备文档的更新，但这并不能成为阻止你现在就开始尝试 2.0 的理由。

这一系列文章通过整理归纳 2.0 相关的各种库的信息，来帮助你快速入门。

<!--more-->

## Vue 2.0.0-rc

### 安装

```shell
npm install vue@next --save-dev
```

### 新 API 指南

2.0 的 API 基本没有发生变化，大多数变化存在于表面之下（比如 virtual DOM），除此之外一部分特性被废除，这样做是为了使 API 更加简洁一致，同时引导你以更好的方式使用 2.0。

如果你在此之前从来没有使用过 Vue，[WIP official 2.0 Guide](http://rc.vuejs.org/guide/) 是最好的起点。这份教程并不需要你在此之前接触过 Vue.js，因此你可以直接跳入 2.0。

即使你有使用 Vue.js 1.x 的经验，浏览一遍新的教程也是一个不错的主意，因为其中有许多新的内容，这全都要感谢 @chrisvfritz 的努力。值得注意的是 API 的部分还没有完成，你可以查看[这个 issue](https://github.com/vuejs/vuejs.org/issues/319) 来追踪文档更新情况。

如果你仅仅想知道相比于 1.x 有哪些变化，你可以查看 [2.0 Changes Github Issue](https://github.com/vuejs/vue/issues/2873)。它会带你快速浏览所有的变化、新特性以及废除的特性，还包括如何用推荐的模式来处理废除的特性（你可以在已经完成的特性和变更列表后面找到这部分内容）。

仓库的 [releases 页面](https://github.com/vuejs/vue/releases)提供了有关每个 beta/rc 发布的详情，包括了详细描述版本变化的扩展信息。

[next 分支中的示例](https://github.com/vuejs/vue/tree/next/examples)同样已经更新到了 Vue 2.0 的版本，因此在这里你可以找到可供参考的示例代码。

如果你还有其他问题（我们确定你一定会有），不要犹豫，来 [http://forum.vuejs.org/](http://forum.vuejs.org/) 提问吧。请不要在 Github 中创建 issue，因为那是专门用来完成报告 Bug、请求功能这类事情。

如果你发现了 Bug，请立即报告给我们！只需要按照 [Issue Reporting Guidelines](https://github.com/vuejs/vue/blob/dev/CONTRIBUTING.md#issue-reporting-guidelines) 即可。

### 独立 vs. 运行时版本

Vue 2.0 有两个可用版本，独立版本和仅运行时版本。

- 独立版本包括模板编译器，并且支持 `template` 选项。
- 仅运行时版本不包括模板编译器，也不支持 `template` 选项。在使用仅运行时版本时你只能使用 `render` 选项。优点是其体积比独立版本轻量约 1/3。

当你使用 `vue-loader` 或 `vueify` 来引入 vue 文件时，文件中的 `template` 部分会被自动编译为 render 方法。因此我们推荐运行时版本和 vue 文件配合使用。

当使用 Browserify 或 Webpack 之类的打包工具时，如果你这样写：

```js
import Vue from "vue";
```

你将会得到仅运行时版本，因为它是 NPM 包的默认导出项。如果你出于某些原因确实想使用独立版本（比如你不得不在 HTML 文档中使用模板），你需要在打包工具中为 vue 配置别名。

以 webpack 为例，将下面代码添加到 webpack 配置中：

```js
// ...
resolve: {
    alias: {vue: 'vue/dist/vue.js'}
},
// ....
```

对于 Browserify，你可以使用 [aliasify](https://github.com/benbria/aliasify) 达到同样的效果。

**注意：不要使用 `import Vue from 'vue/dist/vue'` —— 因为某些工具或第三方库同样会导入 vue，这种写法可能会导致运行时版本和独立版本同时被导入，进而导致错误。**

## 支持库

最主要的支持库是 vue-router —— 一个 Vue 组件路由，以及 vuex —— 一个拥有单一状态树的类 flux 实现。以上两个库目前均发布了 2.0-rc 版本，但文档还没有被更新。

### vue-router

[vue-router](https://github.com/vuejs/vue-router) 是 Vue 官方的路由库，现在已经是 2.0 RC 状态，目前已经实现了对 Vue 2.0 的支持，同时还有若干优化以及重新设计的 API。

2.0 分支中包含了一个[拓展示例](https://github.com/vuejs/vue-router/tree/next/examples)来说明如何使用新的路由 API。

查看 v.2.0.0-beta.1 以上版本的[发布页](https://github.com/vuejs/vue-router/releases)可以得到所有改进详情。

#### 安装

```shell
npm install vue-router@next --save-dev
```

### vuex

**两个 RC 版本？什么鬼？**

是的，目前有两个独立的发布候选版：一个是 1.0 版本（[发布文档](https://github.com/vuejs/vuex/releases/tag/v1.0.0-rc)），另一个是 2.0 版本（[发布文档](https://github.com/vuejs/vuex/releases/tag/v2.0.0-rc.3)）。

那么，两者之间有何区别？

- `v1.0.0-rc.*` 本质上将会是一个针对 `<1.0.0` API 的稳定发布，[目前的文档](http://vuejs.github.io/vuex/)已经与这一版本同步。
- `v2.0.0-rc.*` 是一个使用新 API 的发布候选版，新的 API 包含诸多变化。要了解所有的变化，可以参考[这个关于 2.0 设计的 Github issue](https://github.com/vuejs/vuex/issues/236)，也可以参考 `v2.0.0-rc.1` 最新的[发布文档](https://github.com/vuejs/vuex/releases)。

**这两个版本同时兼容 Vue 1.0 和 Vue 2.0！！**

这是因为 vuex 对于 Vue 2.0 的底层变化来说在很大程度上来说是独立的。

#### 安装

```shell
# v1.0.0-rc.* is tagged as `latest` on npm so the default install will give you this version
npm install vuex --save-dev

# To install `v2.0.0-rc.*`, use the `next` tag
npm install vuex@next --save-dev
```

## 构建工具

vue-loader（webpack 工具）以及 vueify（browserify 工具）也已经更新到位，并提供了预览版。它们仅兼容 Vue 2.0，这其中并没有需要处理的相关 API 改变。

### vue-loader

`v9.0.*` 以上版本开始支持 Vue 2.0。（[发布文档](https://github.com/vuejs/vue-loader/releases)）

```shell
npm install vue-loader@next --save-dev
```

### vueify

vueify 的情况基本相同 —— `v9.0.*` 以上版本支持 Vue 2.0。（[发布文档](https://github.com/vuejs/vueify/releases)）

## vue-cli 和模版

[vue-cli](https://github.com/vuejs/vue-cli) 是一个命令行工具，它可以帮助你快速搭建一个带有 vue-loader 或 vueify 以及其他像 ESlint 支持等功能的项目。

vue-cli 提供两种模版：「普通模版」拥有包括开发环境、测试及生产构建在内的所有功能，而「简化模版」则可以让你快速开始你的代码。

- 普通模版（`webpack` 和 `browserify`）仍 **不** 支持 vue 2.0
- 但简化模版已经支持 2.0，包括 `webpack-simple-2.0` 和 `browserify-simple-2.0`

```shell
vue init webpack-simple-2.0 my-project
vue init browserify-simple-2.0 my-project
```

记得以上模版都还在更新中，但它们可以帮助你快速开始项目。我们的目标是在正式发布时，普通模版将会支持 2.0。

有一个好消息：如果你打算自己动手升级普通模版来支持 Vue 2.0，这并不是一个大工程！我们会很快在这里添加一些指南，所以经常回来看看。

## 服务器端渲染

服务器端渲染功能位于 `vue-server-renderer` 包中。你可以查看它的[文档](https://github.com/vuejs/vue/tree/next/packages/vue-server-renderer)来搞清楚怎样使用。

## 集成 DEMO

[vue-hackernews-2.0](https://github.com/vuejs/vue-hackernews-2.0) demo 是使用 Vue.js、vue-router 和 vuex 的最新 RC 版本从零开始构建起来的，展示了这些库是如何与服务器端渲染无缝协作的。
