---
title: 解决 Typecho 中代码块首行不对齐的问题
date: 2015-04-04 12:15:00
---

写完[《Markdown 基本语法回顾》](http://t.zjy.name/archives/markdown-review.html)这篇文章，发现 typecho 默认主题的代码块样式存在一点小问题。具体表现为代码块的第一行内容存在半个字符左右的缩进，不能与其他行的内容对齐，参见下图：

![代码块首行对齐问题](/usr/uploads/code-tag-padding-problem.png)

<!--more-->

查看开发者工具可以看到代码块的 HTML 代码为：

```html
<pre>
  <code>
    1. 有序列表
    1. 有序列表
    1. 有序列表
  </code>
</pre>
```

对应的 CSS 样式为：

```css
pre code {
  padding: 3px;
  color: #444;
}
```

我们知道，`code` 元素是一个 **行内元素**，`padding` 及 `margin` 属性在行内元素上使用会出现诸多问题。

首先，`padding-top`、`padding-bottom`、`margin-top` 及 `margin-bottom` 属性作用于行内元素时不会改变行内元素所在行的行高。也就是说设置这些属性可能对相邻行产生影响，你可以点击[这里](http://dabblet.com/gist/d931f2a20d87da48ba3c)查看测试代码及效果。

另外，设置了 `padding-left`、`padding-right`、`margin-left` 或 `margin-right` 的行内元素如果遇到换行，则 `padding` 和 `margin` 的效果只会体现在第一行前端和最后一行末尾，即中间行的前端和末尾不会体现 `padding` 或 `margin` 的效果。

typecho 中代码块首行缩进的问题就是由于行内元素设置了 `padding-left` 而又遇到了换行引起的，`pre` 标签导致代码原样输出，换行后 `code` 标签的 `padding` 样式不会在第二行体现，导致第二行不能缩进，因此就出现了首行不能对齐的情况。

找到了问题，解决方法就很简单了，只需要将 `pre` 中的 `code` 元素显示为一个块元素，就可以使 `padding-left` 样式在每行都生效，修改后的代码如下：

```css
pre code {
  display: block;
  padding: 3px;
  color: #444;
}
```

修正后效果如图：

![修正代码块首行对齐问题](/usr/uploads/code-tag-padding-problem-fixed.png)

## 小结

习惯了 DIV + CSS 布局的人很容易就会把针对块元素的各种样式强加给行内元素，虽然部分属性能够生效而且表面上得到了预想的效果，但在使用时仍需多加留意，以避免出现各种问题。
