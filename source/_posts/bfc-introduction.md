---
title: Block Formatting Context (BFC) 浅析
date: 2015-05-27 10:40:00
---

看了很多篇关于 BFC 的文章，发现基本每篇文章都是以引用 W3C 规范中 BFC 的概念来开头。无奈规范终究是规范，里面描述的内容看了 n 多遍之后，还是没有对 BFC 有个清晰的认识。而我写下这篇文章的目的在于能够让人对 BFC 有一个直观的认识，这样再去研究那些晦涩难懂的定义就会有事半功倍的效果。

<!--more-->

## 1 BFC 是什么

从没有认识到最初的认识是一个关键且困难的过程。网上的很多文章都会写道：BFC 是一个环境。这样的写法让人看了就头疼：我们在 HTML 和 CSS 中好像从没接触过环境这个概念。

下面不妨让我用通俗的方式解释一下 BFC 的概念：**BFC 可以简单的理解为某个元素的一个 CSS 属性，只不过这个属性不能被开发者显式的修改，拥有这个属性的元素对内部元素和外部元素会表现出一些特性（后面会讲到），这就是 BFC。**

## 2 BFC 的特性

BFC 对布局的影响主要体现在对 `float` 和 `margin` 两个属性的处理。在我看来，BFC 让 `float` 和 `margin` 这两个属性的表现更加符合我们的直觉。

根据 BFC 对其内部元素和外部元素的表现特性，我将 BFC 的特性总结为 **对内部元素的包裹性** 及 **对外部元素的独立性**。

### 2.1 对内部元素的包裹性

BFC 对内部元素的包裹性主要体现在 BFC 可以包裹浮动元素，以及 BFC 可以包裹 margin。

#### 2.1.1 BFC 包裹浮动元素

BFC 的特性之一就是其高度的计算会包括所有浮动元素的高度，所以使用 BFC 可以包裹浮动元素，达到清除浮动的目的。

```html
<div style="overflow: hidden; background: #AAA;">
  <div
    style="float: left; width: 100px; height: 100px; background: #000;"
  ></div>
</div>
```

`overflow: hidden` 可以触发一个元素的 BFC 属性，使该元素成为一个 BFC 容器，从而使该元素对内部元素及外部元素表现出 BFC 的特性，更多可以触发 BFC 属性的条件会在后面总结。

运行代码可以看到，我们虽然没有进行任何清除浮动的工作，外层 div 还是包裹住了内层浮动的 div，没有造成高度塌陷的情况。

![BFC 包裹 float](/usr/uploads/bfc/bfc-1.png)

另外，将外层 div 同时设为浮动来清除内层浮动的方法(如[这篇文章](http://www.ruanyifeng.com/blog/2009/04/float_clearing.html)中的解决方法二)本质上也是应用了 BFC 的特性，因为将一个元素设为浮动也会触发该元素的 BFC 属性，使外层元素成为一个 BFC 容器。

#### 2.1.2 BFC 包裹 margin

BFC 对内部元素的另一个特性就是可以取消 margin 折叠(margin collapse)。这个特性我喜欢更形象的称之为包裹 margin。

```html
<div style="background: #AAA;">
  <div
    style="width: 100px; height: 100px; margin-top: 50px; background: #000;"
  ></div>
</div>
```

运行代码可以看到，内层 div 的 margin 并没有将内层 div 相对于外层 div 向下推移，而是将内外两层 div 整体向下推移：

![BFC margin-collapse](/usr/uploads/bfc/bfc-2.png)

而我们想要的结果是这样的：

![BFC 包裹 margin](/usr/uploads/bfc/bfc-3.png)

内外两层 div 被整体向下推移的原因就是 margin 折叠，关于 margin 折叠的相关介绍可以参见[这里](http://www.w3school.com.cn/css/css_margin_collapsing.asp)。CSS 中父子元素的 margin 只要相邻，也会发生折叠，CSS 规范虽是如此，但很多时候这并不符合我们的预期：我们希望外部 div 能够包裹内部 div 的 margin，避免形成折叠，这时我们就可以使用 BFC。

```html
<div style="overflow:hidden; background:#AAA;">
  <div
    style="width:100px; height:100px; margin-top:50px; background:#000;"
  ></div>
</div>
```

我们将外层 div 设置为一个 BFC 容器，由于 margin 折叠只会发生在同一个 BFC 中的元素之间，而不同 BFC 的元素之间以及元素及其所属的 BFC 之间不会发生 margin 折叠，因此就可以实现对 margin 的包裹。

### 2.2 对外部元素的独立性

BFC 对外部元素的独立性在于 **BFC 元素不会与浮动元素叠加**。例如：

```html
<div style="float: left; width: 100px; height: 100px; background: #000;"></div>
<div style="height: 200px; background: #AAA;"></div>
```

![浮动覆盖](/usr/uploads/bfc/bfc-4.png)

可以看到，浮动的 div 由于脱离了文档流，导致正常的 div 左上角被覆盖。为了避免这种情况，我们使第二个 div 成为 BFC 容器：

```html
<div style="float: left; width: 100px; height: 100px; background: #000;"></div>
<div style="overflow: hidden; height: 200px; background: #AAA;"></div>
```

![BFC 防止浮动覆盖](/usr/uploads/bfc/bfc-5.png)

当第二个 div 成为 BFC 容器后，其不会再受到浮动 div 的影响，布局相对独立。这样的技巧经常用作两栏或三栏自适应布局。

## 3 触发 BFC

介绍 BFC 的时候我们就已经说过，BFC 可以被理解为元素的一个属性，但是这个属性无法被显式的设置，那么如何触发一个元素的 BFC 属性呢？上面的代码中使用的 `overflow:hidden` 就是触发 BFC 的一种方式，除了设置 `overflow:hidden`，下面的 CSS 属性设置都可以触发 BFC:

- `float` 设置为除 `none` 外的取值；
- `overflow` 设置为除 `visible` 之外的取值；
- `position` 设置为除 `static` 及 `relative` 之外的取值；
- `display` 设置为 `table-cell`、`table-caption`、`inline-block` 中的任一取值；

## 4 BFC 与 Layout

IE 作为浏览器中的奇葩，当然不可能按部就班的支持 BFC 标准，于是乎 IE 中有了 Layout 这个东西。Layout 和 BFC 基本是等价的，为了处理 IE 的兼容性，在需要触发 BFC 时，我们除了需要用上面的 CSS 属性来触发 BFC，还需要针对 IE 浏览器使用 `zoom: 1` 来触发 IE 浏览器的 Layout。

## 5 思考题

BFC 的简单解析到这里就告一段落了。就像文章最初提到的，这篇文章的目的是为了让大家对 BFC 有一个快速直观的认识，方便更加深入规范的学习 BFC。所以仅仅阅读这篇文章是远远不够的，想要全面学习 BFC 还请参考网上的其他文章。

最后，这道思考题可以用来检验一下自己是不是真的明白了 BFC 的基本概念：

在使用 BFC 防止浮动覆盖的代码中，我们在第二个 div 中插入一些文本：

```html
<div style="float: left; width: 100px; height: 100px; background: #000;"></div>
<div style="height: 200px; background: #AAA;">content</div>
```

得到了如下的效果：

![思考](/usr/uploads/bfc/bfc-6.png)

那么这里的问题就是：为什么 div 的左上角被覆盖了，而文本却没有被覆盖？

## 修订历史

1. 2017-02-19：格式修订
