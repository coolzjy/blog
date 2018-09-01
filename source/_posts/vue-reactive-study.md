---
title: Vue 响应式原理探析
date: 2016-01-10 13:00:00
---

## 1 Vue 的基础 —— getter/setter

同样是实现了双向绑定，但 Vue 使用的方法与 Angular 却完全不同。Vue 的文档中是这样描述的：

> 把一个普通对象传给 Vue 实例作为它的 `data` 选项，Vue.js 将遍历它的属性，用 `Object.defineProperty` 将它们转为 getter/setter。这是 ES5 特性，不能打补丁实现，这便是为什么 Vue.js 不支持 IE8 及更低版本。

getter/setter 使得开发者有机会在对象属性取值和赋值的时候进行自定义操作，响应系统便是基于这个特性实现的。

<!--more-->

## 2 Watcher

Watcher 是 Vue 核心。**每个 Watcher 都拥有一个自己的表达式，Watcher 的作用就是维护这个表达式依赖的数据项，并在数据项更新的时候更新表达式的值。** 其实从 Vue 的实现来讲，Watcher 应该被叫做 Listener 或 Subscriber 更加合适。

> 模板中每个指令/数据绑定都有一个对应的 watcher 对象，在计算过程中它把属性记录为依赖。之后当依赖的 setter 被调用时，会触发 watcher 重新计算 ，也就会导致它的关联指令更新 DOM。
> ![reactive](http://cn.vuejs.org/images/data.png)

不单单是模板中的指令和数据绑定，计算属性也是由 Watcher 来实现的，可以说 Vue 中 Watcher 无处不在。

## 3 依赖收集

Watcher 和数据项之间的依赖关系是一个多对多的关系，即一个 Watcher 可以依赖多个数据项，一个数据项也可以被多个 Watcher 依赖。那么问题就来了：Vue 是怎样管理 Watcher 和数据项之间的依赖关系的呢？答案就是 **依赖收集**。

依赖收集是通过 property 的 getter 完成的，依赖收集的过程涉及到 Vue 的三类对象：Watcher、Dep 和 Observer。其中 Observer 负责将数据项转化为响应式对象，而 Dep 则用来描述 Watcher 和 Observer 的依赖关系。

Vue 中，每个 Observer 对应一个 Dep 对象，而每个 Dep 对象可以对应多个 Watcher，每个 Watcher 也可以对应多个 Dep 对象，从而实现了多对多的依赖关系。

搞清楚了三类对象，下面就来看看依赖关系到底是怎样建立起来的：

1. Vue 实例初始化的过程中，首先，每个数据项都会生成一个 Observer，每个 Observer 又会初始化一个 Dep 实例；
2. 接下来，模板中的每个指令和数据绑定都会生成一个 Watcher 实例，实例化的过程中，会计算这个 Watcher 对应表达式的值；
3. 计算开始之前，Watcher 会设置 Dep 的静态属性 `Dep.target` 指向其自身，开始依赖收集；
4. 计算表达式的过程中，该 Watcher 依赖的数据项会被访问，从而触发其 getter 中的代码；
5. 数据项 getter 中会判断 `Dep.target` 是否存在，若存在则将自身的 Dep 实例保存到 Watcher 的列表中，并在此 Dep 实例中注册 Watcher 为订阅者；
6. 重复上述过程直至 Watcher 计算结束，`Dep.target` 被清除，依赖收集完成；

在依赖关系建立后，每当数据项发生变化（setter 被访问），Observer 会调用其 Dep 实例的 notify 方法，在这个 Dep 实例中注册的 Watcher 将会被通知，并重新进行计算及依赖收集的过程，然后执行相应的回调函数。以上就是完成响应的整个过程。

## 4 计算属性与 Lazy Watcher

前面说到，不仅是模板中的指令和数据，Vue 中的计算属性同样是一个 Watcher。不同的是，计算属性依赖的是一个 Lazy Watcher。

Lazy Watcher 与普通 Watcher 最大的不同在于：依赖发生变化后，Lazy Watcher 不会马上计算表达式的新值，而是在 Watcher 下次被访问时才进行计算。
