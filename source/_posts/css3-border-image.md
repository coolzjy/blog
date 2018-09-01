---
title: CSS 3 border-image 属性详解
date: 2015-07-27 22:00:00
---

HTML / CSS / JavaScript 这三门 Web 前段的基本技术中，最难以标准化的当属 CSS —— 因为人美的审美标准无法被标准化。红极一时的拟物化风格被扁平化风格取代前后也不过两三年的时间，你根本无法预测 3 年之后拟物化会不会卷土重来。面对现代社会人们审美标准的快速变化，CSS 必须要硬着头皮完成「内容表现」这个费力不讨好的任务，而想要完成好这个任务并非易事，CSS 必须被设计的足够灵活，以尽可能满足所有表现需求。这次要介绍的 `border-image` 就是这样一个足够灵活的属性。

<!--more-->

## 1 `border-image` 属性简介

`border-image` 属性是 CSS3 的新增属性，这个属性允许开发者使用图片来定义盒模型的边框，来取代 CSS2 中仅有的几个预定义边框样式（border-style）。

说到边框样式，我个人认为这是 CSS 2 中最鸡肋的一个设计，因为除了 solid 之外的边框样式使用频率都非常低，特别是 groove ridge inset outset 这几个 3D 边框样式，由于本身的样式不够精致统一且无法进行自定义，加之近年来扁平化设计成为主流，更是鲜有人使用。能够更加灵活的定义边框样式的属性 `border-image` 便在这种情况下出现了。

`border-image` 是一个简写属性，分别设定了 `border-image-source`、`border-image-slice`、`border-image-width`、`border-image-outset`、`border-image-repeat` 几个属性。

## 2 图片如何用作边框

刚接触 `border-image` 属性的人或许都会有这个疑问：盒模型的边框部分是一个环形，而图片素材是一个矩形，那么素材图片如何应用到边框上呢？

其实，`border-image` 通过对图片素材的切割，把一个矩形的素材图片变成一个环形的边框。具体来说，素材图片被切割成九宫格的形式，你可以想象一下重庆九宫格火锅。没错，就是这货：

![九宫格火锅](/usr/uploads/border-image/border-image-1.jpg)

（图片来自网络）

一张矩形的素材图片经过横竖各两刀的切割，并挖去中间的一格后就形成了一个环形，这就是我们边框的原型。聪明的你可能已经想到了，如何使用被划分出的八格素材来生成一个边框：左上、右上、左下、右下的四格素材分别作为边框的四个角，而上下左右的四格素材分别经过不同形式的扩展，形成边框的四条边。下面的图片很好的解释了边框素材的处理方式：

![边框素材处理方式](/usr/uploads/border-image/border-image-2.png)

上面提到的几个属性，决定了 `border-image` 的素材被处理的具体方式。

## 3 `border-image` 属性

### 3.1 `border-image-source` 属性

`border-image-source` 属性用来指定边框的素材，语法可以参照 `backgound-image`，这里就不再过多解释。需要注意的是，如果只设置了 `border-image-source` 属性而其他属性使用缺省值，则边框素材不会被划分九宫格，而是将整个素材按照边框宽度缩放至合适尺寸后安放在边框四角。

![只设置 border-image-source](/usr/uploads/border-image/border-image-3.png)

### 3.2 `border-image-slice` 属性

`border-image-slice` 属性用来设置边框素材的切割尺寸，完整的 `border-image-slice` 属性包括 4 条切割线参数，依次是上横切割线，右竖切割线，下横切割线，左竖切割线。数值分别代表从上、右、下、左边缘向素材中心延伸的像素 / 百分比数，需要特别注意的是，切割的数值只接受像素和百分比两个单位，并且 **像素单位必须省略**，也就是说 `border-image-slice` 属性的值只能是 `30` 或 `30%` 的形式，而 `30px` 这种写法是不被接受的。例如，`border-image-slice: 10 10 30 10` 代表图片素材按照下图的样式被切割：

![切割样式](/usr/uploads/border-image/border-image-4.png)

### 3.3 `border-image-repeat` 属性

`border-image-repeat` 属性用来设置上下左右四边（即 2、4、5、7 四个素材块）的呈现形式，分别有 `stretch`、`repeat`、`round`、`space` 四个取值，呈现形式分别如下：

- `stretch`：指定用拉伸方式来填充边框背景图。
- `repeat`：指定用平铺方式来填充边框背景图。当图片碰到边界时，如果超过则被截断。
- `round`：指定用平铺方式来填充边框背景图。图片会根据边框的尺寸动态调整图片的大小直至恰好可以铺满整个边框。
- `space`：指定用平铺方式来填充边框背景图。图片会根据边框的尺寸动态调整图片的之间的间距直至恰好可以铺满整个边框。

### 3.4 `border-image-width` 属性

`border-image-width` 属性用来设置边框素材的宽度，语法可以参照 `border-width` 属性。如果同时设置了 `border-image-width` 和 `border-width` 属性，那么边框的实际宽度由 `border-width` 属性决定。此时，如果 `border-image-width` 属性小于 `border-width` 属性，边框图片会沿边框的外侧分布而内侧留空形成 padding 的效果；如果 `border-image-width` 属性大于 `border-width` 属性，边框图片会仍会沿边框的外侧分布而内测溢出，具体效果看以参考下面的图片：

![border-image-width 效果](/usr/uploads/border-image/border-image-5.png)

### 3.5 `border-image-outset` 属性

`border-image-outset` 属性会产生使 border-image 相对于原始位置向外侧推移的效果，设置 `border-image-outset` 属性会使 border-image 溢出，但不会影响整个盒模型的尺寸，因此在设置此属性时要特别注意防止元素间的相互干扰。语法同样可以参照 `border-width` 属性。

![border-image-outset 效果](/usr/uploads/border-image/border-image-6.png)

### 3.6 `border-image` 简写属性

`border-image` 简写属性的语法为（来自 MDN）：

```auto
<'border-image-source'> || <'border-image-slice'> [ / <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'> ]? || <'border-image-repeat'>
```

简单来说，简写属性中 `border-image-slice`、`border-image-width`、`border-image-outset` 三个属性必须相邻并按照上述顺序书写，属性间以 `/` 分隔，`border-image-width` 和 `border-image-outset` 两个属性值分别对其前项有依赖，即设置 `border-image-slice` 后才能设置 `border-image-width`，设置 `border-image-width` 后才能设置 `border-image-outset`；其余属性值以空格分隔，且不要求书写顺序。

下列声明是合法的：

```css
border-image: url("border-image.png");
border-image: url("border-image.png") 30 round;
border-image: url("border-image.png") 30/20px round;
border-image: url("border-image.png") 30/10px/10px round;
border-image: round url("border-image.png") 30;
border-image: round 30; /* 合法但单独使用无意义 */
```

而下面声明是非法的：

```css
border-image: url("border-image.png") / 20px round;
border-image: url("border-image.png") / 20px/5px round;
/* 定义 border-image-outset */
border-image: url("border-image.png") 30/5px round;
```
