---
title: 使用 DocumentFragment 进行性能优化？
date: 2015-11-22 21:40:00
---

最近发现 DOM 中还有 DocumentFragment 这么一个东西，顾名思义，这个 API 为开发者提供了创建一个文档碎片的能力，由于实在太简单了所以这里就不展开解释这个 API 的功能了，需要进一步了解的小伙伴可以自行 Google。如果你从未听说过 DocumentFragment，这也难怪，因为想来这东西就是几个 element 编个组，用 JavaScript 配合数组完全能够取代。但就是这么一个简单的 API，居然被玩出了新花样 —— 性能优化。

<!--more-->

一扯到性能优化的话题上，逼格似乎就提升了一个等级。毕竟凡事先谈做得到，再谈做得好嘛，自己还在埋头研究是不是做得到的工夫人家就在讨论怎么做的好了，瞬间就感觉不在一个档次了。但是，DocumentFragment 真的是这么一个高逼格的东西么？

我们先来看看那些声称 DocumentFragment 能带来性能优化的人宣扬的理论吧。动态操作 DOM 所带来的页面重排和重绘是非常耗时的，这恐怕是对前端领域稍稍深入研究的童鞋都知道的道理。而 DocumentFragment 能够带来性能优化的理论便是基于此。「优化派」认为：连续的操作 DOM 将导致浏览器持续进行重排和重绘的动作，这必将大幅影响性能；而如果引入 DocumentFragment，那么只进行了一次 DOM 插入操作，所以性能将会得到优化。这个说法听起来挺有道理，但事实果真如此吗？

实践是检验真理的唯一标准，用两个 HTML 页面，我们可以很方便的进行验证：两个页面中，我们分别直接和使用 DocumentFragment 插入 10000 个节点，然后用 Chrome 监测两个页面的性能，两个页面中的 JS 代码分别如下：

直接插入节点：

```js
for (var i = 0; i < 10000; i++) {
  var div = document.createElement("div");
  div.innerText = i;
  document.body.appendChild(div);
}
```

使用 DocumentFragment 插入节点

```js
var docFrag = document.createDocumentFragment();

for (var i = 0; i < 10000; i++) {
  var div = document.createElement("div");
  div.innerText = i;
  docFrag.appendChild(div);
}

document.body.appendChild(docFrag);
```

使用 chrome 监测得到的两个页面的性能表现如下：

![两种节点插入方式的性能比较](/usr/uploads/documentfragment.png)

如果我不说，你有可能知道哪个页面使用了 DocumentFragment 吗？好吧，现在公布答案：左边的是直接插入，而右边的是 DocumentFragment 插入。通过实验我们看到，是否使用 DocumentFragment 对页面性能可以说毫无影响。

结果已经得到，那么接下来就需要分析一下原因，为什么「优化派」的理论听起来靠谱，但却与事实相悖呢？

我认为，这个理论中的主要问题在于 DocumentFragment 插入时只需要进行一次渲染这一点。我们想当然的认为 DocumentFragment 就像是现实中的纸片，但事实并非如此。作为一个 DocumentFragment，其自身是不具备渲染相关属性的 —— 也就是其自身没有定位、尺寸及其他样式。这也就决定了 DocumentFragment 在插入文档时不可能作为一个整体进行渲染。因此 DocumentFragment 在插入文档的过程中还是要分别渲染其内部元素，与直接插入元素产生的效果无异。
