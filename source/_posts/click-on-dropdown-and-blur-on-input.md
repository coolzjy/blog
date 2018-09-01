---
title: 下拉列表 click 事件与文本框 blur 事件冲突的三个解决方法
date: 2015-06-28 12:30:00
---

Autocomplete 特性能够很有效的提升用户体验，因此在很多地方都会用到。无奈直到 html5 都没有支持这一特性的原生控件，因此只能通过现有的控件配合 CSS 和 JavaScript 来实现。因为这种形式非常常见，所以很多 JavaScript 库或插件都能很好的完成这一功能。但是为了学习，还是有必要使用原生 JavaScript 来独立完成一下这个功能。

<!--more-->

Autocomplete 控件的主要功能特征如下：

1. 对文本框中输入的文本进行实时匹配，有匹配项时显示下拉列表；
2. 使用上下箭头高亮下拉列表中的项目，回车键选中高亮项目，高亮项目填充到文本框中，收起下拉列表；
3. 鼠标经过时高亮下拉列表中的项目，**单击选中高亮项目**，高亮项目填充到文本框中，收起下拉列表；
4. **文本框失去焦点时收起下拉列表**；

这几个功能中 3 和 4 其实存在冲突，即单击选择列表中的项目时，会首先触发文本框的 blur 事件，导致下拉列表收起，此时在下拉列表中绑定的 click 事件不能完成，导致项目无法被选中。

经过搜索，发现以下三个方法可以解决上面的问题：

## 1 抱佛脚 —— 为文本框的 blur 事件添加延时

为了避免 click 事件因为对象被隐藏而无法触发，因此可以让下拉列表延时隐藏，为响应 click 事件争取时间：

```js
// Jquery Code
$("#input-text-for-autocomplete").blur(function () {
  setTimeout(function () {
    $("#dropdown").hide();
  }, 200);
});
```

让下拉列表延时收起，可以解决列表项无法被选中的问题。但延时方法最大的不足在于延时时间的掌握：经过在 Chrome 中的测试，延时设置为 100ms 时，click 事件尚不能 100% 被触发，200ms 时才能实现完全触发，再将浏览器差异及客户端配置考虑进去，设置多久的延时时间确实是一个难以两全的问题 —— 时间太短不能保证 click 事件的 100% 触发，而时间太长则会造成卡顿的感觉，影响用户体验。因此，设置延时并不是这一问题的最佳解决方案。

## 2 完美 —— blur 事件的动态绑定

仔细分析我们的需求，其实我们是希望当我们在下拉列表中点击时不触发文本框的 blur 事件。对 blur 事件进行动态绑定，可以实现我们的要求：

```js
// Jquery Code
// 鼠标进入下拉列表区域，取消文本框的 blur 事件绑定
$("#dropdown").mouseenter(function () {
  $("#input-text-for-autocomplete").off("blur", hideDropdown);
});
// 鼠标移出下拉列表区域，为文本框绑定 blur 事件
$("#dropdown").mouseleave(function () {
  $("#input-text-for-autocomplete").on("blur", hideDropdown);
});
```

动态绑定 blur 事件的方法是一个完美的解决方案，没有任何兼容性的问题，因此可以放心使用。但我们贪婪的希望更简洁的代码，因此就有了下面的方案。

## 3 简洁 —— mousedown 代替 click

我们一次点按鼠标会形成多个事件，为了能够成功选中下拉列表项，我们必须使用一个在 blur 事件之前触发的事件，而 mousedown 就是我们要找的事件，通过下面的代码我们可以知道一次点按鼠标形成多个事件的发生顺序：

```js
$("#input-text-for-autocomplete").blur(function () {
  console.log("blur");
});
$("#dropdown")
  .mousedown(function () {
    console.log("mousedown");
  })
  .mouseup(function () {
    console.log("mouseup");
  })
  .click(function () {
    console.log("click");
  });
```

运行的结果如下：

```auto
mousedown
blur
mouseup
click
```

可以看到，mousedown 事件先于 blur 事件执行，而 click 事件是最后才被执行，这也就更清楚的解释了为什么 click 事件无法生效。因此，我们只需要用 mousedown 事件替换 click 事件，不需要修改其他事件处理逻辑，就可以很好的实现 autocomplete 功能。只需要修改一个事件名，因此这个方法足够简洁。

但另一方面，使用 mousedown 替代 click，使得很多高级功能无法实现，比如下拉列表中的拖拽功能。

## 总结

上面介绍了三种让 blur 事件和 click 事件共存的方法。在没有特殊需要的情况下，推荐大家选择第三种方法，这种方法在保证兼容性的前提下足够简洁。如果需要在下拉列表中实现更多高级功能，那就选择第二种方法。而第一种方法稳定性和用户体验都存在一定的问题，所以不推荐使用。

## 修订历史

1. 2017-02-19：格式化代码
