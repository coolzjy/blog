---
title: 字符计数（一）
date: 2021-06-24 22:00:00
categories:
  - 分享
---

> 本文整理自技术分享，可以在[这里](/presentations/counting-characters)获取演示文稿。

「不超过 20 个字符」应该是每个前端工程师都处理过的需求。当你不假思索的写出 `input.length <= 20` 这样的代码时，有没有仔细思考过 `length` 是如何定义的？它能否准确表示字符的数量？

<!--more-->

## `String.prototype.length`

> The String type is the set of all ordered sequences of zero or more 16-bit unsigned integer values (“elements”) up to a maximum length of 253 - 1 elements.

> The number of elements in the String value represented by this String object.

以上两段分别是 ECMAScript 中对[字符串类型](https://262.ecma-international.org/11.0/#sec-ecmascript-language-types-string-type)以及[字符串 `length` 属性](https://262.ecma-international.org/11.0/#sec-properties-of-string-instances-length)的定义。可以看到字符串 `length` 属性代表的是字符串中 _element_ 的个数，而 _element_ 则表示一个 16 bit 的无符号整型数值，即 1 个字节对。也就是说，`length` 等于字符串占用的字节数 / 2。

## UTF-16 编码

明确了 `length` 的定义再来讨论第二个问题：`length` 是否代表字符的数量？既然 `length` 表示的是字符串由多少个字节对组成，那么这个问题就变成了：1 个字符是否恰好占用 1 个字节对？很显然这就涉及到了编码问题。

我们知道 JavaScript 中的字符串使用的是 UTF-16 编码。根据定义，UTF-16 是一种变长编码，需要使用 1 个或 2 个字节对来表示一个字符。到这里，我们终于可以回答开篇提出的问题：`length` 其实并不能准确表示字符数量。

具体来说，根据 UTF-16 的编码细节，我们经常使用的字符大多数都可以通过 1 个字节对进行编码，因此 `length` 属性在大多数情况下都可以正常工作。最常见的例外情况是 emoji 字符，例如「😂」（[U+1F602](https://unicode-table.com/cn/1F602/)）的 `length` 就是 2，汉字「𫟹」（[U+2B7F9](https://unicode-table.com/cn/2B7F9/)）的 `length` 也是 2。当字符串中包含这些字符时，使用 `length` 属性就无法得到符合预期的结果了。

## 代理对技术

解决了 `length` 是否准确的问题，新的问题随之而来：UTF-16 编码在何时使用 1 个字节对，何时使用 2 个字节对？又是如何使用 2 个字节对来表示 1 个字符的呢？这就要涉及到 Unicode 字符分区以及代理对技术。

Unicode 共定义了 0x10FFFF 个码点，被分为 0 - 16 共 17 个平面。其中 0 号平面被称为基本多语种平面，1 - 16 号平面被称为扩展平面。基本多语种平面包含了从 0x0000 到 0xFFFF 共 65536 个码点，覆盖了世界主要语言的常用字符和标点。UTF-16 中，这部分码点可以用 1 个字节对来编码。

对于扩展平面中 0x010000 - 0x10FFFF 共 1048576 个码点，则需要通过代理对技术来编码。具体地，我们在基本多语种平面中预留 `Math.sqrt(1048576)` 即 1024 个码点作为代理码点使用，使用 2 个代理码点组成的代理对即可表示全部 1048576 个码点。

举例来讲，假设我们预留基本多语种平面中的 0xD800 - 0xDBFF 这 1024 个码点作为代理码点，则要表示「😂」（[U+1F602](https://unicode-table.com/cn/1F602/)）这个字符，可以按照以下步骤计算代理对：

```js
代理对高位 = Math.floor((0x01F602 - 0x010000) / 1024) + 0xD800 = 0xD83D
代理对低位 = (0x01F602 - 0x010000) % 1024 + 0xD800 = 0xDA02
```

实际编码时，为了实现[编码自同步](https://en.wikipedia.org/wiki/Self-synchronizing_code)的特性，需要在基本多语种平面中分别保留代理对高位和代理对低位两组共 2048 个码点（实际使用的代理对高位为 0xD800 - 0xDBFF，代理对低位为 0xDC00 - 0xDFFF）。根据新的规则得到的代理对如下：

```js
代理对高位 = Math.floor((0x01F602 - 0x010000) / 1024) + 0xD800 = 0xD83D
代理对低位 = (0x01F602 - 0x010000) % 1024 + 0xDC00 = 0xDE02
```

可以使用 `charCodeAt` 方法获取代理对中的单个码点来验证我们的计算是否正确：

```js
"😂".charCodeAt(0).toString(16);
// "d83d"
"😂".charCodeAt(1).toString(16);
// "de02"
```

将代理对还原为对应的码点只需要进行对应的逆向运算即可，这里就不再赘述了。

## 小结

完整弄清楚了 JavaScript 中 `String.prototype.length` 的定义、Unicode 的分区以及 UTF-16 编码中的代理对技术，我们就可以使用代码来计算一个字符串中 Unicode 字符数：

```js
function countUnicodeCharacters(str) {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    // 过滤掉代理对低位即可
    if (charCode < 0xdc00 || charCode > 0xdfff) {
      result++;
    }
  }
  return result;
}
```

觉得太麻烦？ES2015 中其实也提供了对应的 API 来完成 Unicode 码点级别的操作，包括：[`String.prototype[@@iterator]`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/@@iterator)、[`String.prototype.codePointAt`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt) 以及 [`String.fromCodePoint`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint)。使用 `String.prototype[@@iterator]` 我们可以很方便的以 Unicode 码点为单位来计算字符串长度：

```js
[...input].length <= 20;
```

至此，我们使用字符串中 Unicode 码点数量取代字节对数量更精确地对字符进行计数，但这并不是字符计数问题的终点：我们上面讨论的是以一个 Unicode 码点就是一个可见字符为基础的，但事实并不如此，例如 `[..."café"].length !== [..."café"].length`，虽然两个字符串都只有 4 个字符，但前者的 Unicode 码点数为 4，而后者的 Unicode 码点数为 5，这又是为什么呢？其中的原因我们会在下篇文章中继续讨论。
