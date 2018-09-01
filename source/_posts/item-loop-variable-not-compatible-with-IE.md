---
title: JavaScript for in 循环中使用 item 作为循环变量在 IE 下的问题
date: 2015-06-19 14:20:00
---

百度前端技术学院完成的任务一直没有拿到 IE 中测试，今天在 IE 11 中打开任务 3 的页面，却发现 JavaScript 没有正常执行，通过开发人员工具调试发现如下错误：`SCRIPT5007: 无法获取未定义或 null 引用的属性“type”`。发生错误的代码段是一个 `for in` 循环：

```js
for(item in data){
  if(data[item].type === 't'){ //这里发生了错误
    ...
  }
  ...
}
```

<!--more-->

检视 item 变量，发现 item 竟是一个本地方法：

![item 是本地方法](/usr/uploads/item.png)

于是写了一个 DEMO 页面：

```js
var foo = {
  a: 1,
  b: 2,
};
for (item in foo) {
  console.log("foo." + item, ":", foo[item]);
}
```

Chrome 中输出：

```auto
foo.a : 1
foo.b : 2
```

而 IE 中输出：

```auto
foo.
function item() {
  [native code]
}
  : undefined
foo.
function item() {
  [native code]
}
  : undefined
```

可以看到，本应该作为循环变量的 item 确实变成了本地方法 `function item { [native code] }`。以「item method IE」关键词搜索，发现 item 方法是 DOM 中的一个方法（[MSDN](<https://msdn.microsoft.com/zh-cn/library/ms536460(v=vs.85).aspx>)、[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/NodeList/item)）。MSDN 和 MDN 中对 item 方法的描述都是从节点列表中取特定节点。只不过 MSDN 中支持使用节点名作为参数，并且 IE 中将这个方法添加到了 window 对象，使之成为了一个全局方法。使用 item 作为循环变量时，IE 认为这里的 item 指的是全局方法 item，因此就出现了文章开头遇到的问题。

进一步研究发现，Chrome 中并没有将 item 作为全局方法，在 Chrome 中调用 `item(0)` 会提示错误 `item is not defined`。另一方面，IE 中的全局 item 方法其实并没有什么卵用，在 IE 中调用 `item(0)` 同样会提示错误，只不过错误内容是 `找不到成员`。这其实一点不出乎意料：item 作为一个 DOM 方法，当然要在 DOM 对象调用才有效，而全局对象 window 并不是一个 DOM 对象，找不到任何子节点也是理所当然。IE 把 item 作为全局变量不知是作何考虑，但不管 item 有没有用，它确实污染了全局空间。

回头看自己写过的代码，同样存在很多可以改进之处。首先，使用 `for in` 进行对象属性遍历时一般情况下要使用 hasOwnProperty 方法过滤原型链中的属性，必要的时候还需要进行类型判断，过滤掉所有方法，这一做法能够大大提高代码的健壮性。例如在出现问题的代码中加入了判断，虽然得不到想要的结果，但整个程序不会异常终止。在遍历数组对象时更好的做法是使用普通 `for` 循环来替代 `for in` 循环，这样可以有效避免各种问题出现。

最后，我将代码中所有数组遍历的代码改用普通 `for` 循环实现，并重命名的 `for in` 循环中的循环变量，代码顺利在 IE 中执行。

---

许久之后再看这篇文章，发现当时的代码简直不堪入目，`for (item in foo)` 应当写为 `for (var item in foo)`，所以后面写的很多基本都是废话了，就把这篇文章当作成长的记录吧。

## 修订历史

1. 2017-02-19: 修正文章错误
