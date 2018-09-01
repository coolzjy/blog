---
title: 作为参数的函数中上下文（this）的问题
date: 2015-04-22 21:40:00
---

Javascript 是一门非常灵活的语言。在 Javascript 中函数被视作一个对象，因此可以被作为一个参数传递给其他函数。但当一个函数对象作为参数传递给其他函数时，其运行的上下文环境就会发生变化：

```js
function Foo() {
  this.testFuncFoo = function () {
    alert(this.constructor);
  };
}

var foo = new Foo();

foo.testFuncFoo();
testFunc(foo.testFuncFoo);

function testFunc(arg) {
  arg();
}
```

<!--more-->

上面这段代码中，我们通过输出上下文对象的构造函数，来判断当前上下文对象的类型。可以看到，使用 foo 对象直接调用 testFuncFoo 函数，函数中上下文环境 `this` 指向的是 foo 对象本身。而将这个函数作为参数，传递给一个函数 testFunc 执行时，testFuncFoo 中 `this` 指向的是全局对象 `window`。这里我们猜测：作为参数传入，并在另一个函数中执行的方法，其上下文与执行这个方法的函数的上下文相同。于是我们可以做进一步验证：

```js
function Foo() {
  this.testFuncFoo = function () {
    alert(this.constructor);
  };
}

function Bar() {
  this.testFuncBar = function (arg) {
    arg();
  };
}

var foo = new Foo();
var bar = new Bar();

foo.testFuncFoo();
bar.testFuncBar(foo.testFuncFoo);
```

如果满足我们的猜测，那么在 bar 对象的函数中执行 testFuncFoo 函数，上下文对象应当是 bar 对象。但运行结果标明，在 bar 对象的函数中执行 testFuncFoo 函数，testFuncFoo 中上下文对象仍然是 `window`。所以这次我们可以得出：**所有没有直接被某个对象调用的函数，其上下文环境都是全局对象（严格模式下为 `undefined`）。**

为了能够在作为参数传入的函数中使用指定的上下文对象，可以使用 bind 绑定函数的上下文环境：

```js
testFunc(foo.testFuncFoo.bind(foo));
```

bind 定义在`Function.prototype`中，因此可以被任何函数对象调用。当一个函数调用 bind 后，会返回一个新函数，这个函数会始终以 bind 参数中传递的对象作为上下文执行。（`bind` 函数的详细说明可以参见[这里](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)）

bind 函数在 ECMAScript 5 中才作为标准加入，为了支持所有浏览器，我们可以自己完成 bind 函数的功能：

```js
Function.prototype.myBind = function (obj) {
  oldFunc = this;
  var newFunc = function () {
    return oldFunc.apply(obj);
  };
  return newFunc;
};

function testFunc() {
  alert(this.name);
}

var testObj = {
  name: "testObj",
};

testFunc.myBind(testObj)();
```

myBind 函数会返回一个绑定了当前函数和上下文对象的新函数，执行返回的函数总是会把绑定的对象作为上下文。上面的 myBind 函数显然还是一个半成品，它还不能处理函数的参数和各种错误情况。如果需要 polyfill bind 函数，可以选择 [npm 上的 function-bind](https://www.npmjs.com/package/function-bind)。

## 修订历史

1. 2017-02-19：移除 bind polyfill 的具体实现，提供 function-bind 链接
