---
title: CSS 中常用 @ 规则
date: 2015-05-22 16:00:00
---

## @ 规则

CSS 中的 @ 规则是一条以 `@` 符号开头的 CSS 语句，后面紧跟一个标识符，并以分号结束，如果规则处于声明块中，则以第一个声明块结束。

常用的 @ 规则如下：

- `@charset` 定义外部样式表使用的字符集。
- `@import` 引入一个外部样式表。
- `@media` 进行媒体查询来使符合特定媒体条件的样式生效。
- `@font-face` 下载外部字体。

<!--more-->

## `@charset` 规则

`@charset` 规则用来定义外部样式表使用的字符集。如果使用这条 @ 规则，那么它必须作为样式表的第一条语句出现，并且前面不能有任何字符。如果一个样式表中出现了多条 `@charset` 规则，只有第一条规则会生效。

通常，我们只需要在外部样式表中使用如下 `@charset` 规则即可：

```css
@charset "UTF-8";
```

## `@import` 规则

`@import` 规则用来在样式表中引入一个外部样式表，可以将它理解为 CSS 语法中的 `<link rel="stylesheet">` 标签。`@import` 规则必须出现在除了 `@charset` 规则的任何其他规则之前。通过配合媒体查询使用，`@import` 标签可以针对不同媒体应用特定的外部样式表。

`@import` 的常用方法如下：

```css
@import url("custom.css");
@import url("mobile.css") (max-width: 600px);
```

针对媒体查询这里需要注意的是，包含媒体查询的 `@import` 规则并不是根据查询结果来引用外部样式表，而是根据查询结果应用外部样式表。也就是说：**不论媒体查询结果是否满足，外部样式表都会被引入。包含媒体查询的 `@import` 规则并不能减少网络访问次数。**（link 标签中的媒体查询亦是如此。）

## `@media` 规则

`@media` 规则用来针对某个特定的媒体查询应用一组 CSS 规则，`@media` 规则可以出现在样式表的任何位置，甚至可以嵌套在其他 @ 规则中。

`@media` 的常用方法如下：

```css
@media print {
  .hide-on-print {
    visibility: hidden;
  }
}
```

媒体查询语句包括 _媒体类型查询_ 和 _媒体特性查询_。媒体类型查询用来定义特定媒体类型的样式，常用的媒体类型包括 all、screen、print，分别对应所有媒体、屏幕及打印。媒体特性查询用来定义满足特定条件的媒体的样式，常用的媒体特性查询参数包括 width、height、orientation、resolution 等。当下流行的响应式布局，大部分是通过媒体特性查询来实现的。例如下面代码可以控制一个网页部件在手持设备上不展现：

```css
@media screen and (max-width: 480px) {
  .hide-on-mobile {
    display: none;
  }
}
```

有关媒体查询的更多细节，可以参见[这里](https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Media*queries)。

## `@font-face` 规则

`@font-face` 规则可以让网页不再拘泥于用户的本地字体，而可以使用在线字体进行网页渲染，从而极大提高了网页的表现力和统一性。另一方面，`@font-face` 规则的流行与 iconfont 的普及也密不可分。

iconfont 通过把图标封装成为字体，代替图片在网页上进行呈现，从而方便的实现了图标缩放、颜色替换等特性，并且 iconfont 相比图片更加节省流量。

由于不同浏览器支持的字体类型不同，为了保证浏览器兼容性，`@font-face` 规则一般按照下面的形式书写：

```css
@font-face {
  font-family: "YourWebFontName";
  src: url("YourWebFontName.eot"); /* IE9 Compat Modes */
  src: url("YourWebFontName.eot?#iefix") format("embedded-opentype"), /* IE6-IE8 */
      url("YourWebFontName.woff") format("woff"),
    /* Modern Browsers */ url("YourWebFontName.ttf") format("truetype"), /* Safari, Android, iOS */
      url("YourWebFontName.svg#YourWebFontName") format("svg"); /* Legacy iOS */
}
```
