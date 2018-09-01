---
title: 字符计数（二）
date: 2021-06-30 22:00:00
categories:
  - 分享
---

> 本文整理自技术分享，可以在[这里](/presentations/counting-characters)获取演示文稿。

在[上篇文章](/counting-characters-1/)结尾我们提到，一个可见字符并不严格对应一个 Unicode 码点：如 `é` 由 2 个 Unicode 码点组成。这就涉及到 Unicode 一个很重要的特性：组合字符。

<!--more-->

## 组合字符与预组字符

[组合字符](https://zh.wikipedia.org/wiki/%E7%B5%84%E5%90%88%E5%AD%97%E7%AC%A6)指的是由一个或多个附加字符修饰主要字符的组合形式，这种形式在编码时会占据多个码位，而渲染时往往只占用一个字符的位置。最常见的修饰字符是拉丁字母中的变音符号：如上文中的锐音符（´），以及重音符（ˋ）、扬抑符号（ˆ）、抑扬符（ˇ）等等。上文中的 `é` 就是由主要字符 `e`([U+0065](https://unicode-table.com/cn/0065/)) 和锐音附加字符 `́`（[U+0301](https://unicode-table.com/cn/0301/)）组合而成，因此占据 2 个 Unicode 码点。

在实践中，为了兼容性与编码效率，常用的组合字符会被单独赋予一个 Unicode 码位，称为[预组字符](https://zh.wikipedia.org/wiki/%E9%A2%84%E7%BB%84%E5%AD%97%E7%AC%A6)。例如上篇文章结尾提到的 `é`([U+00E9](https://unicode-table.com/cn/00E9/)) 与 `é`([U+0065](https://unicode-table.com/cn/0065/) [U+0301](https://unicode-table.com/cn/0301/))，前者为预组字符，占用 1 个 Unicode 码点，而后者为组合字符，占用 2 个码点。

汉字本质上也属于组合字符，Unicode 中目前编码的汉字可以视作预组字符。为了使 Unicode 更具扩展性和开放性，Unicode 3.0 中加入了[表意文字描述字符](https://zh.wikipedia.org/wiki/%E8%A1%A8%E6%84%8F%E6%96%87%E5%AD%97%E6%8F%8F%E8%BF%B0%E5%AD%97%E7%AC%A6)，用来支持汉字的组合。遗憾的是表意文字描述字符目前还没有被字体及排版引擎广泛支持，想要体验这一特性，可以[使用思源宋体来测试 biang 这个字的渲染](https://www.thetype.com/2017/04/11961/#:~:text=%E9%82%A3%E4%B8%AA%20bi%C3%A1ng%20%E5%88%B0%E5%BA%95%E6%98%AF%E4%BB%80%E4%B9%88%EF%BC%9F%E4%B8%BA%E4%BB%80%E4%B9%88%E5%AD%97%E7%AC%A6%E4%B8%B2%E9%87%8C%E6%9C%89%E5%A5%BD%E5%A4%9A%E8%99%9A%E7%BA%BF%E6%A1%86%E6%A1%86%EF%BC%9F)。

## 等价性与正规化

组合字符和预组字符带来了一个问题，那就是意义完全相同的字符序列，编码为 Unicode 时可能因为分别使用了组合字符与预组字符，而产生不同的码位序列。虽然人类可以把这两个不同的序列理解为相同的含义，但计算机却无法按照字形去解析这些序列，组合字符与预组字符对于计算机来说就是完全不同的内容，因此在进行字符串比较时无法得到预期的结果。

为了解决上述问题，Unicode 提出了[等价性](https://zh.wikipedia.org/wiki/Unicode%E7%AD%89%E5%83%B9%E6%80%A7)的概念。顾名思义，Unicode 将一些码位序列定义为相等的，并提供了两种等价概念：标准等价与兼容等价。前者是后者的一个子集。可以简单理解为：标准等价的两个 Unicode 码位序列可以渲染出相同的字形序列（即在字体支持的前提下，两个标准等价的码位序列渲染结果完全相同）；而兼容等价的两个 Unicode 码位序列不一定会渲染出相同的字形序列，但却表达了相同的语义。举例来说，上文中反复提到的例子 `é` 与 `é` 便满足标准等价；而 `⁵` 和 `5` 两个码位，都表示了 5 的含义，因此满足兼容等价。

有了等价的定义，便可以准确的对两个码位序列进行比较了。在实际操作过程中，这一过程是通过正规化来完成的。具体来说，正规化能够将码位序列转化为定义好的正规形式。Unicode 规范定义了四种正规形式，分别是 NFD、NFC、NFKD、NFKC。其中 NFD、NFKD 会将序列转化为分解形式，区别为 NFD 以标准等价的方式来分解，而 NFKD 则是以兼容等价的方式来分解。而 NFC 和 NFKC 则是将在分解后在使用标准等价重组序列。简单理解，NFD、NFKD 会将码位拆解为标准/兼容等价的最长码位序列表示，而 NFC、NFKC 则会将码位合并为标准/兼容等价的最短码位序列表示。

在 ES 2015 中，可以使用 `String.prototype.normalize()` 方法进行正规化：

```js
const combiningCharacter = "é"; // 组合字符
const precomposedCharacter = "é"; // 预组字符

[...combiningCharacter].length; // 2
[...precomposedCharacter].length; // 1

combiningCharacter === precomposedCharacter; // false

// 组合字符的标准兼容重组序列为预组字符
combiningCharacter.normalize("NFC") === precomposedCharacter; // true
// 预组字符的标准兼容分解序列为组合字符
precomposedCharacter.normalize("NFD") === combiningCharacter; // true
// 使用相同的正规化形式即可准确判断两个字符串是否相等，normalize 方法缺省参数为 'NFC'
combiningCharacter.normalize() === precomposedCharacter.normalize(); // true

// 使用兼容等价正规化形式可以判断两个字符串是否语义等价
"123".normalize("NFKC") === "①②③".normalize("NFKC"); // true
```

## 连字符与合字

结合 `String.prototype[@@iterator]`，我们现在可以更准确的计算字符串的字符数：

```js
[...input.normalize()].length <= 20;
```

但当用户在输入中使用了一些 emoji，上面的方法又失效了：

```js
[..."👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦".normalize()].length <= 20; // false
```

为什么明明只有 3 个「字符」，却得到大于 20 的长度？我们通过字符串迭代器查看每个「字符」的 Unicode 码点:

```js
[..."👨‍👩‍👧‍👦"];
// (7) ['👨', '‍', '👩', '‍', '👧', '‍', '👦']
```

可以看到 1 个可见字符其实对应了 7 个 Unicode 码点，除了 👨（[U+1F468](https://unicode-table.com/cn/1F468/)）、👩（[U+1F469](https://unicode-table.com/cn/1F469/)）、👧（[U+1F467](https://unicode-table.com/cn/1F467/)）、👦（[U+1F466](https://unicode-table.com/cn/1F466/)）这四个独立的 emoji，每两个 emoji 中间还有一个不可见字符，通过查询字符码点可以知道，这个字符就是零宽连接符（[U+200D](https://unicode-table.com/cn/200D/)）。

零宽连接符表示符号前后的两个码点连接表示一个字符。值得注意的是，只有在渲染引擎支持这一特性，且字体支持这一连接的码点序列时才会渲染为一个字符，否则每个码点将会分别渲染。也就是说并不是所有由零宽连接符连接的码点序列在渲染时结果都只有一个字符。例如：`👦‍👧` 这个字符串，虽然中间使用了零宽连接符连接，但由于码位序列并没有在字体中对应的字形，只能渲染成为两个独立的 emoji。（注：在文章写作时尚未定义，不排除 Unicode 后续版本将该序列规范化）。

除了使用零宽连接符创建新的 emoji，在极致的平权思想的推动下， 几乎所有涉及人物的 emoji 还可以连接[肤色修饰符](https://unicode-table.com/cn/emoji/component/skin-tone/)：`👍🏻👍🏼👍🏽👍🏾👍🏿`。上述 5 个可见字符其实是由 10 个 Unicode 码位组成：👍🏿 = 👍([U+1F44D](https://unicode-table.com/cn/1F44D/)) + [Emoji Modifier Fitzpatrick Type-6] ([U+1F3FF](https://unicode-table.com/cn/1F3FF/))

## 总结

讲到现在，我们开头提到的问题仍然没有被解决：如何判断字符串长度？无法解决这个问题的原因是我们自始至终没有对「字符串长度」给出一个严谨的定义。

一般来讲，用户理解的长度限制一定是「可见字符数量」，但相信经过上面的讨论你已经能够理解，想要准确获得可见字符的数量是几乎不可能实现的：除了要考虑各种组合字符、零宽字符、合字及修饰符，还需要考虑渲染引擎是否支持上述特性，使用的字体是否能够渲染特定的合字等等情况。或者换句话来说，在不同的渲染环境中，相同的码点序列可能得到不同的结果（相信大家都会碰到在 emoji 在终端中无法正常渲染的情况）。

退而求其次，更加合理的选择是使用 Unicode 码点数量来代表字符串长度。一方面大多数 Unicode 码点最终的渲染结果都是一个可见字符，另一方面代码中获取码点数量的成本不高。这应该是最为通用的解决方案。
