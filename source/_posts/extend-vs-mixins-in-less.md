---
title: "[译] Less 中的 extend 和 mixins 对比"
date: 2015-06-15 10:30:00
---

> 原文地址：[http://transmission.vehikl.com/less-extend/](http://transmission.vehikl.com/less-extend/)

如果你曾经使用过 Less，你一定借助过 mixins 的力量来减少样式表中的重复劳动（DRY）。

<!--more-->

也许你有如下的标准按钮样式：

```less
.btn {
  background: blue;
  color: white;
}
```

下面你想要把这些样式包含在一个更具体的按钮中。

你可以使用 mixins 来方便的将一个类混合到另一个类中，这可以让你不通过复制粘贴来复用这些样式。

```less
.round-button {
  .btn;
  border-radius: 4px;
}
```

## 无论如何不要做重复劳动（DRY）

上面的用法乍看起来是成功的，但是如果你仔细研究编译好的 CSS 就会发现一些浪费空间的重复语句：

```css
.btn {
  background: blue;
  color: white;
}

.round-button {
  background: blue;
  color: white;
  border-radius: 4px;
}
```

注意 `.btn` 类中的样式是如何仅被拷贝到 `.round-button` 类中的？

标准 CSS 允许我们对选择器进行分类，所以我们实际上可以用更少的代码来手写这个样式表：

```css
.btn,
.round-button {
  background: blue;
  color: white;
}

.round-button {
  border-radius: 4px;
}
```

那么这是怎么回事？如果 Less 应该比 CSS 好得多，那么它为什么不会智能的利用 CSS 默认提供的这个节约代码的重要特性？

## Extend

这是一个合理的抱怨，也是许多人选择 Sass 来替代 Less 的一大原因。但在 1.4 版本中，Less 添加了 extend 语法，优雅的解决了这个问题。

通过像下面这样改写我们原始的 Less 代码：

```less
.btn {
  background: blue;
  color: white;
}

.round-button {
  &:extend(.btn);
  border-radius: 4px;
}
```

我们可以得到下面的输出，这正是我们手写过的代码：

```css
.btn,
.round-button {
  background: blue;
  color: white;
}

.round-button {
  border-radius: 4px;
}
```

## 特别注意

### 嵌套的选择器

默认情况下，嵌套的选择器不会被扩展，所以下面的代码：

```less
.footer {
  padding: 20px;
  h2 {
    color: white;
  }
}

.feed {
  &:extend(.footer);
}
```

会被编译成如下 CSS，`.feed` 类下的 `h2` 会被忽略：

```css
.footer,
.feed {
  padding: 20px;
}

.footer h2 {
  color: white;
}
```

你可以通过使用 `all` 关键字来使 Less 包含所有嵌套的选择器：

```less
.feed {
  &:extend(.footer all);
}
```

上面的代码可以给出你期望的结果：

```css
.footer,
.feed {
  padding: 20px;
}

.footer h2,
feed h2 {
  color: white;
}
```

你也可以使用一个特定的嵌套选择器：

```less
.feed {
  &:extend(.footer h2);
}
```

### 媒体查询

extend 只会扩展在同一个媒体查询中的选择器。

下面的代码是有效的：

```less
@media (max-width: 1024px) {
  .feed {
    padding: 20px;
  }
  .sig {
    &:extend(.feed);
  }
}
```

而下面的是无效的：

```less
.feed {
  padding: 20px;
}

@media (max-width: 1024px) {
  .sig {
    &:extend(.feed);
  }
}
```

## 那么 mixins 该怎么使用

太棒了！但是如果 extend 是更好的选择，我们还需要 mixins 吗？

### 参数化的 mixins

当你只是需要在几个类之间共享静态样式时，extend 是你不二的选择，但是当你需要添加动态样式时，就必须使用 mixins 了。

我们还是来谈谈按钮吧，假如我们有如下代码：

```less
.btn {
  background: #217a39;
  border: 1px solid #0f3c1c;
  border-radius: 4px;
  color: #fff;
  &:hover {
    background: #3eb061;
    border-color: #165929;
  }
}
```

上面的代码生成了一个很酷的绿色小按钮，还有一个漂亮的鼠标滑过效果。

现在，如果我们想复用这个按钮，但要给按钮设置一个不同的颜色该怎么办？entend 在这里真的帮不到我们，但 mixins 可以轻而易举的完成：

```less
.btn(@color) {
  background: @color;
  border: 1px solid darken(@color, 15);
  border-radius: 4px;
  color: #fff;
  &:hover {
    background: lighten(@color, 10);
    border-color: darken(@color, 5);
  }
}
```

使用上面的 mixin，我们可以定义很方便的定义一系列不同的按钮：

```less
.btn-success {
  .btn(#18682f);
}

.btn-alert {
  .btn(#9b6910);
}

.btn-error {
  .btn(#9b261a);
}
```

## 总结

无论在哪里你使用了静态的 mixins，都可以用 extened 来替换，这能够有效减少文件大小。只在当你需要传递一个参数的时候，才保留这个 mixins。
