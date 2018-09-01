---
title: 即将到来的前端布局利器 —— Flexbox
date: 2015-09-23 00:00:00
---

## 0 前端干的都是脏活累活

不得不说，作为光鲜亮丽的互联网的门面担当，前端这个工种干的其实都是脏活累活。作为一个前端人也只能用「要是前端再简单那就要失业了」来聊以自慰，不过这样的辩解绝对不能成为阻碍技术进步的理由。当下的前端技术，特别是 CSS（单单看版本号就知道 CSS 有多落后了），已经远跟不上前端开发的需求了。整个前端开发很多时候是在做打补丁式的工作 —— 一面坑坑洼洼的墙，先拿水泥填坑堵封，然后才能上漆创作（所以说 polyfill 这个词真的用的特别贴切） —— 要是你不知道两三种垂直居中或者自适应三栏布局的实现方法都没资格说自己是干前端的。不得不承认这种技术落后除了能够稍微提高行业门槛外没有一丁点好处，特别是在发展速度飞快的互联网行业。

<!--more-->

> 题外吐槽：记得大概十年之前表格布局风靡一时：那时候的网页上所有的元素都是放在框线隐藏的表格中的，通过切图、拼接实现网页所有的效果。后来表格布局这一形式被 DIV + CSS 布局拿着「内容表现分离」大棍子重重打倒在地。我一直觉得表格布局死的有些冤枉，因为 CSS 这家伙连毛都还没长全就当上了大哥。就拿垂直居中说，这应该是一个基本的表现形式，但 CSS 愣是不支持，主流的垂直居中实现都是在做填坑的工作：用 `line-height`？你怎么知道内容就只有一行，这说到底还没有完全实现内容表现分离。用 `table-cell`？撇开兼容性不谈，内容本来不是表格非要被套上表格的样式，反而高端大气上档次了？想想也是让人发笑。表格布局拿手的多栏自适应就更不用说了，用 CSS 实现还要搬出 `float`、`absolute` 这种鬼都不想用的属性……CSS 完全没有把表格布局的优点融入自身，就把表格布局打败了，所以说表格布局死的冤。

好在技术是不断进步的，埋头填坑那么久的我们也应该时常抬头看看有没有坑少一点的墙 —— Flexbox 就是这么一面墙。虽然现在你还不能在上面创作（Flexbox 的标准还属于工作草案，就不用谈浏览器兼容性问题了），但是至少应该感受一下这面墙的魅力。

## 1 Flexbox 是揍啥滴

我特别喜欢在学习新的事物之前能够得到关于这个事物概括而易懂的描述，这种描述能够让我在学习之间把握事物的全貌，对掌握学习方向、提升学习效率大有好处。在接触 Flexbox 之后我把 Flexbox 做的事情概括为两句话：1. 提供了更好用的弹性布局；2. 将硬盒变成了软盒。

上面的概括可能还是太抽象，我们不妨拿我们排版中经常遇到的问题来具象化。首先，横向排列 block 元素想必已经成为了前端的基本功，用到的方法无外乎 float 和 inline-block 两种，float 方法完全是对 `float` 属性驴唇马嘴的使用，inline-block 看起来很美但又不得不处理空隙问题，有了 Flexbox，你可以很方便的控制盒的排列方向来实现横向排列的 block，这就依托于 Flexbox 提供的更好的弹性布局。其次，三栏自适应布局这种同样属于前端基本功的排版，其实现方法也相当的不优雅，最重要的是自适应的栏只能有一个，有了 Flexbox，不依赖 JavaScript 实现多栏同时自适应变得易如反掌（至少相对于目前的蹩脚方法是这样），这种便利是 Flexbox 将硬盒变成了软盒所带来的福利。

## 2 直观认识 Flexbox

说了这么多 Flexbox 的优势，下面我们通过两个例子来对 Flexbox 有一个直观的认识：

### 2.1 多栏布局高度自适应

在多栏布局中使所有栏的高度自适应内容最多一栏的高度是一项繁琐的工作，一般使用 `padding` 配合负 `margin`，或表格布局来实现。如果使用 Flexbox 来实现，根本不需要任何额外代码：

<style>
  #multi-column {
    display: flex;
    text-align: center;
  }
  #multi-column section {
    flex: auto;
    width: 150px;
    padding: 10px;
    background: #0f704e;
  }
  #multi-column section + section {
    margin-left: 10px;
  }
</style>
<section id="multi-column">
  <section>Column with more content</section>
  <section>Column</section>
  <section>Column</section>
  <section>Column</section>
</section>

### 2.2 双飞翼布局

两个侧栏宽度固定，中间一栏宽度自适应的双飞翼布局可以称得上前端的基本功了。双飞翼布局一般采用 `margin` 配合 `float` 和 `absolute` 实现。而放在 Flexbox 中则变得易如反掌：

<style>
  #holy-grail {
    display: flex;
    height: 100px;
  }
  #holy-grail .left, #holy-grail .right {
    width: 100px;
    background: #2bbd8a;
  }
  #holy-grail .center {
    flex: auto;
    margin: 0 10px;
    background: #0f704e;
  }
</style>
<section id="holy-grail">
  <section class="left"></section>
  <section class="center"></section>
  <section class="right"></section>
</section>

## 3 弹性布局

在布局方面，Flexbox 在块布局（block layout）、行内布局（inline layout）、表格布局（table layout）和定位布局（positioned layout）之外提供了弹性布局（flex layout）。新的布局涉及到下面这些 CSS 属性：

- `display`：`display` 属性增加了两个新的取值：`flex` 和 `inline-flex`，这两个取值分别会将当前元素转换为块级和行内级的*弹性容器（Flex container）*，并在其中生成*弹性格式化上下文（Flex formatting context）*，弹性容器的子元素被称为*弹性元素（Flex item）*。
- `flex-flow`、`flex-direction`、`flex-wrap`：这三个新属性用来控制弹性容器中弹性元素的排布规则，其中 `flex-flow` 是另外两个属性的集合属性。
- `order`：用来调整元素的显示顺序。
- `justify-content`、`align-content`、`align-items`、`align-self`：这四个属性从两个维度对弹性元素在弹性容器中的对齐方式进行控制。
- `margin`：在弹性布局中，margin 会有不同以往的表现形式。

### 3.1 弹性元素的排列方向：`flex-direction`、`flex-wrap`

`flex-direction` 属性允许我们自由设置弹性元素的排列方向，除了水平方向排列（`flex-dirction: row`）和竖直方向的排列（`flexdirectiion: column`），Flexbox 还提供了水平反方向（`flex-dirction: row-reverse`）和竖直反方向（`flex-dirction: column-reverse`）两个排列方向。后面两个排列方向会使得弹性元素由右（下）至左（上）排列，这放在目前的排版手段中几乎是不敢想象的。

在这里还有一点需要注意：我们这里所说的方向，弹性布局中称为*轴（axis）*，我们设置的布局方向称为*主轴（main axis）*，与主轴垂直的方向称为*副轴（cross axis）*。搞清楚主轴的方向才能进一步进行对齐等排版选项的设置。

`flex-wrap` 属性可以控制弹性容器的换行方式，其默认值为 `nowrap`，即不换行。如果设置了 `flex-wrap: wrap`，那么弹性元素会通过换行的方式来在副轴方向扩展。一般情况下，这两个属性已经完全能够我们的需求了，但 Flexbox 居然还提供了 `wrap-reverse` 这种属性，设置 `flex-wrap: wrap-reverse` 后换行方向会改变为副轴的反方向，即向上或向左换行。

### 3.2 弹性元素的排列顺序：`order`

虽然响应式布局看似已经成熟了，但其实目前 CSS 功能还不能支撑起跨设备的丰富表现形式，最简单的一个例子就是无论何种形式，各部分内容的相对位置（或者说顺序）是固定不变的 —— 目前 CSS 中还不存在调整元素呈现顺序的属性。而 Flexbox 就提供了这一特性：通过设置弹性元素的 `order` 属性的值，可以修改元素出现的顺序 —— `order` 属性值越小的元素将获得越优先的位置，配合媒体查询就可以在不同设备上非常灵活的调整元素位置。

### 3.3 弹性元素的对齐方式：`justify-content`、`align-content`、`align-items`、`align-self`

Flexbox 四个控制对齐方式的属性，从两个维度对弹性元素的对齐方式进行控制。首先是 `justify-content` 、`align-content` 两个属性，这两个属性分别用来控制弹性元素在主轴方向上及所有弹性行在副轴方向上的对齐方式。而 `align-items`、`align-self` 两个属性分别对所有弹性元素和单个弹性元素设置在弹性行内副轴方向上的对齐方式（类似于 `vertical-align`）。下面这张图可以帮你更好的理解这四个属性的作用。

![Flexbox 对齐](/diagrams/flex-properties.png)

`justify-content`、`align-content` 两个属性的可选属性值大抵相同，分别是 `flex-start`、`flex-end`、`center`、`space-around` 及 `space-between`，`align-content` 额外拥有一个 `stretch` 属性值。几个属性值的效果如下（例子展示的是 `justify-content` 的效果，`align-content` 的对应的属性在副轴上拥有相同的效果）：

<style>
  #justify-content {
    display: flex;
  }
  #justify-content > section {
    width: 50px;
    height: 50px;
    margin: 5px;
    background: #0f704e;
  }
</style>

<label id="justify-content-label">
  <code>
    justify-content:
    <select>
      <option value="flex-start">flex-start</options>
      <option value="flex-end">flex-end</options>
      <option value="center">center</options>
      <option value="space-around">space-around</options>
      <option value="space-between">space-between</options>
    </select>
  </code>
</label>

<section id="justify-content">
  <section></section>
  <section></section>
</section>
<script type="module">
const container = document.querySelector("#justify-content");
const select = document.querySelector("#justify-content-label select")
container.style.justifyContent = select.options[0].value;
select.addEventListener("change", (e) => {
  container.style.justifyContent = e.target.value;
});
</script>

`align-content` 的另一个属性值 `stretch` 会在副轴方向上拉伸每个弹性行（即增加弹性行的行高），以使得所有弹性行填充整个弹性容器。

控制弹性元素对齐的另外一组属性 `align-items`、`align-self` 分别用来设置所有弹性元素和单个弹性在弹性行内副轴上的对齐方式。两个属性的可选属性值时相同的，分别是：`flex-start`、`flex-end`、`center`、`baseline`、`stretch`，属性值各自的效果如下：

<style>
  #align-items {
    display: flex;
  }
  #align-items > section {
    width: 50px;
    margin: 5px;
    background: #0f704e;
  }
  #align-items > section:nth-child(1) {
    min-height: 25px;
  }
  #align-items > section:nth-child(2) {
    min-height: 50px;
  }
</style>

<label id="align-items-label">
  <code>
    align-items:
    <select>
      <option value="flex-start">flex-start</options>
      <option value="flex-end">flex-end</options>
      <option value="center">center</options>
      <option value="baseline">baseline</options>
      <option value="stretch">stretch</options>
    </select>
  </code>
</label>

<section id="align-items">
  <section></section>
  <section></section>
</section>
<script type="module">
const container = document.querySelector("#align-items");
const select = document.querySelector("#align-items-label select")
container.style.alignItems = select.options[0].value;
select.addEventListener("change", (e) => {
  container.style.alignItems = e.target.value;
});
</script>

`align-items` 和 `align-self` 两个属性的默认值都是 `stretch`，这也就是我们可以通过 Flexbox 轻松实现多栏自适应等高布局的关键所在。另外一个需要特别关注的属性值是 `baseline`，该属性值会将每个弹性元素首行的基线对齐。

### 3.4 不一样的表现：`margin`

对 CSS 稍微深入研究的童鞋一定都知道 margin 折叠（margin collapse），在弹性布局中我们终于可以和这个蛋疼的设定 say goodbye 了。弹性布局中的边距不会进行折叠，并且 margin 会自动覆盖容器中多余的空间。这使得使用 `auto` 属性设置垂直居中变成了可能。

## 4 弹性盒

在 Flexbox 之前，一个元素的实际尺寸只能是两种情况：一种是采用自身设置的固定值来确定自身的实际尺寸，另一种是采用百分比的方式来根据父元素的尺寸来确定自身的实际尺寸。而 Flexbox 的出现使得我们有一种全新的途径来确定元素的实际尺寸，那就是按照一定的规则来分配父元素空间，从而确定元素自身的实际尺寸。而大多数情况下我们希望容器中的所有元素应当填满整个容器，这就要求这个空间分配规则必须能够在容器空间不足时收缩子元素的尺寸来避免内容溢出，在子元素尺寸不足以填充容器时扩展子元素的尺寸来避免留空现象。这就是 Flexbox 中弹性盒的概念。

Flexbox 新增了 `flex`、`flex-basis`、`flex-grow`、`flex-shrink` 几个 CSS 属性用来实现弹性盒。其中，`flex` 是一个集合属性（`flex-grow` `flex-shrink` `flex-basis`）。下面我们就来分别了解一下这些属性。

### 4.1 `flex`（`flex-grow` `flex-shrink` `flex-basis`）

一个具有弹性的对象最本质的特征就是可以根据需要进行拉伸和压缩，`flex-grow`、`flex-shrink` 这两个属性分别定义了弹性盒的拉伸和压缩规则。`flex-grow`、`flex-shrink` 两个属性的取值均为不为负的数字，代表该元素拉伸或压缩的权重。`flex-grow` 的默认值为 `0`，即不拉伸；`flex-shrink` 的默认值为 `1`，即按照 1 的权重压缩该元素。那么权重是如何工作的呢？

Flexbox 利用权重来拉伸（或压缩）弹性盒的机制很容易理解：当弹性行有剩余（或溢出）空间时，这些空间就会由所有弹性元素来分担，假设弹性行的剩余（或溢出）空间为 90px，两个弹性元素的 `flex-grow`（或 `flex-shrink`）属性值分别为 `2` 和 `1`，那么这两个弹性元素将会分别拉伸（或压缩） 60px 和 30px 来使得弹性行恰好被填满，这就是弹性盒的弹性机制。

至于 `flex-basis` 属性，它规定了弹性元素的自然状态，默认值为 `auto`，这时弹性元素会根据 `width` 或 `height` 属性来确定自己的初始状态，当 `flex-basis` 设置了 `auto` 以外的值时，元素的 `width` 或 `height` 属性值将会被覆盖。

## 5 小结

与一个事物接触的时间长了，我们的思想会逐渐受到禁锢。CSS 之于我就是一个很好的例子：回想起初次接触前端（好吧，其实那时候大家管这个活叫做网站）尝试写 HTML 和 CSS，我在很长一段时间内都直觉的认为盒子应该是「一个个从左到右排列，填满一行再折到下一行」这样的的表现形式。相信跟我相同感觉的童鞋也不在少数。但在不断地学习、实践的过程中，就慢慢习惯了这种有悖直觉的设定。直到 Flexbox 的出现才让我眼前一亮：这东西写出来才 TM 是我真正想要的效果嘛！

所以说，在学习技术的时候，工夫要扎进去但思想不要扎进去。借陈皓大牛的一句话与大家共勉：人永远不要禁锢自己！
