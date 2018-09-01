---
title: 正确处理 Promise Rejection
date: 2020-10-26 18:30:00
---

## TL;DR

浏览器会在每个事件循环周期结束时检查所有 promise，如果存在 reject 状态且没有添加处理器的 promise，则会触发 unhandledrejection 事件。因此，异步处理 promise rejection 无法阻止 unhandledrejection 事件，为了避免无效的 unhandledrejection 事件，所有的 promise rejection 都应该被同步处理。

## unhandledrejection 事件

unhandledrejection 事件相信大家都不陌生，我们可以通过在 window 上监听 unhandledrejection 事件得到没有被正确处理的 reject 状态 promise：

```js
window.addEventListener("unhandledrejection", function (event) {
  console.log(event.promise);
  console.log(event.reason);
});
```

其中，event 对象是 PromiseRejectionEvent 类的实例，除了继承自 Event 类的属性和方法，PromiseRejectionEvent 还提供了 promise 和 reason 两个属性，分别用来表示没有被处理的 promise 实例以及其 reject 的原因。一般来说，JavaScript 错误追踪程序会把 unhandledrejection 事件作为数据来源之一。

## unhandledrejection 事件的触发时机

unhandledrejection 事件的触发时机是与事件循环紧密相关的。简单来说，浏览器会在每个事件循环周期结束时检查所有 promise，如果存在 reject 状态且没有添加处理器的 promise，则会触发 unhandledrejection 事件。具体的实现逻辑可以参考[这篇文章](https://zhuanlan.zhihu.com/p/62210238)。也就是说，如果在一个事件循环周期内没有妥善处理 promise rejection，那么 unhandledrejection 事件就会被触发；进一步地，异步处理 promise rejection 无法避免 unhandledrejection 事件：

```js
(async function () {
  try {
    const fooPromise = Promise.reject();
    await sleep(500); // 省略了 sleep 方法的实现
    await fooPromise;
  } catch {}
})();
```

在 Node.JS 中执行上面的代码，会得到如下警告：

```
(node:63896) UnhandledPromiseRejectionWarning: undefined
(node:63896) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)
(node:63896) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
(node:63896) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 1)
```

可以看到虽然我们在异步方法中使用 `try catch` 语句包裹了所有 `await` 表达式，但仍然触发了 unhandledrejection 事件。原因就在于给 `fooPromise` 添加处理器（await）之前，sleep 异步操作导致当前事件循环结束，引擎对所有 promise 进行检查并触发事件。交换 `await sleep(500);` 和 `await fooPromise;` 两行代码为 `fooPromise` 同步的添加处理器就可以避免 unhandledrejection 事件触发。另外我们还可以看到，对一个 promise rejection 进行异步处理时引擎还会触发 rejectionhandled 事件，并且给出 _Promise rejection was handled asynchronously_ 的警告。

## 处理 promise rejection 的最佳实践

对 promise rejection 进行异步处理虽然对业务逻辑没有任何影响，但其产生的 unhandledrejection 事件会被 Sentry 等错误追踪程序捕获为一个异常。所以处理 promise rejection 的最佳实践就是始终同步地为 promise 添加错误处理器。在代码实践中可以采取以下几种形式：

首先，对于 promise 之后的异步操作，可以使用 Promise.all / Promise.race 以及 Pomise.any / Promise.allSettled 方法来进行 promise 状态协调。一方面这些方法会同步地处理被协调 promise 的状态变化，不会产生 unhandledrejection 事件；另一方面，使用这些方法也会让代码逻辑更加清晰。

```js
try {
  await Promise.all([foo(), bar()]);
} catch {}
```

在无法使用上述状态协调器的情况下，不论何时关注 promise 的状态变化，都应该同步的添加 rejection 处理器：

```js
try {
  const fooPromise = foo();
  const barPromise = bar();
  fooPromise.catch(noop);
  barPromise.catch(noop);
  await fooPromise;
  await barPromise;
} catch {}
```

promise 的 then/catch 方法都会返回一个新的 promise，而不会改变原本 promise 的状态，因此上面的的代码即可以保证原本的逻辑，又可以避免触发 unhandledrejection 事件。
