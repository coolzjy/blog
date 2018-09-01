---
title: "[译] 被动事件监听器（Passive Event Listeners）"
date: 2017-06-04 14:20:00
---

被动事件监听器（Passive Event Listeners）是 [DOM 规范](https://dom.spec.whatwg.org/#dom-eventlisteneroptions-passive)中的一个新特性，它让开发者可以通过排除触摸和滚动事件监听器中阻止默认行为的需求，得到更好的滚动表现。开发者可以在触摸或滚动事件中使用 `{ passive: true }` 来标注不会调用 `preventDefault`。这一特性在 [Chrome 51](https://www.chromestatus.com/features/5745543795965952)、[Firefox 49](https://bugzilla.mozilla.org/show_bug.cgi?id=1266066) 中已经可用，在 [Webkit 中也已经实现](https://bugs.webkit.org/show_bug.cgi?id=158601)。被动事件监听器（Passive Event Listeners）的实际表现对比可以在下面的视频中查看：

[示例视频（需要科学上网）](https://www.youtube.com/watch?v=NPM6172J22g)

<!--more-->

## 问题

流畅的滑动表现是良好的 Web 浏览体验的重要部分，对于触摸式设备来说更是如此。现代浏览器内置了 Threaded scrolling 特性来保证即使在耗时的 JavaScript 运行时也能有流畅的滚动表现，但当存在 touchstart 和 touchmove 事件绑定时，由于事件处理器中可以调用 [`preventDefault`](http://www.w3.org/TR/touch-events/#the-touchstart-event) 来完全阻止滚动，所以浏览器必须等待事件处理器的执行进而导致滚动优化失效。虽然在某些场景下，作者的确希望阻止滚动，但分析指出绝大多数触摸事件处理器并没有真正调用 `preventDefault` 方法，因此浏览器常常在非必要的情况下阻塞滚动。举例来说，Android Chrome 中需要阻塞滚动的触摸事件中，80% 并没有阻止滚动。这 80% 的事件中，有 10% 会将滚动开始的时间推迟超过 100ms，有 1% 的滚动会发生超过 500ms 的灾难性延迟。

许多开发者意想不到的是：[仅仅是在 document 上添加一个空的触摸事件处理器](http://rbyers.github.io/janky-touch-scroll.html)就使得滚动表现显著下降。开发者有足够的理由期待一个[并不会带来任何副作用](https://dom.spec.whatwg.org/#observing-event-listeners)的添加处理器的动作。

这其中基本的问题不只限于触摸事件。[滚动事件](https://w3c.github.io/uievents/#events-wheelevents)也会遇到相同的问题。相比之下，[pointer event 处理器](https://w3c.github.io/pointerevents/)旨在永远不会延迟滚动（虽然开发者可以使用 `touch-action` 这一 CSS 属性来明确地完全阻止滚动），所以并不会遇到这个问题。本质上来讲，被动事件监听器的提议将 pointer events 的性能特性移植到触摸事件和滑动事件上。

这一提议给开发者提供了一个途径，通过这一途径开发者可以在事件处理器注册时指出处理器中是否会调用 `preventDefault()`（即是否需要一个[可取消的](https://dom.spec.whatwg.org/#dom-event-cancelable)事件）。当触摸和滚动事件都没有要求一个可取消的事件，用户代理可以不用等待 JavaScript 执行，而立刻开始滚动。也就是说，被动事件处理器不会有意外的性能副作用。

## EventListenerOptions

首先，我们需要一个机制来给事件监听器附加额外的信息。目前来看 `addEventListener` 的 `capture` 参数是一个最为相似的例子，但它的用法极其不透明：

```js
document.addEventListener("touchstart", handler, true);
```

[`EventListenerOptions`](https://dom.spec.whatwg.org/#dictdef-eventlisteneroptions) 使我们能够写得更加明确：

```js
document.addEventListener("touchstart", handler, { capture: true });
```

这只是现有行为新的（可扩展的）语法 —— 规定[你的监听器在捕获阶段还是冒泡阶段触发](http://javascript.info/tutorial/bubbling-and-capturing#capturing)。

## 解决方案：`passive` 选项

现在我们有一个可扩展的语法用于在事件处理器注册时指定选项，我们可以添加一个新的 `passive` 选项，它预先声明了事件监听器永远不会调用 `preventDefault()`。否则，用户代理将会像对待 `Event.cancelable=false` 的事件一样忽略该请求（理想情况下至少在控制台生成一条警告）。开发人员可以通过在调用 `preventDefault()` 之前和之后查询 `Event.defaultPrevented` 来验证这一点。例如：

```js
addEventListener(
  document,
  "touchstart",
  function (e) {
    console.log(e.defaultPrevented); // 将会是 false
    e.preventDefault(); // 由于监听器是被动的，所以什么也不会发生
    console.log(e.defaultPrevented); // 仍然是 false
  },
  Modernizr.passiveeventlisteners ? { passive: true } : false
);
```

现在，相较于只要存在 touch 或 wheel 监听器时滚动就会被阻止，浏览器只有在 _非被动_ 监听器（参见 [TouchEvent 规范](http://w3c.github.io/touch-events/#cancelability)）时才阻止滚动。`被动`监听器不会带性能副作用。

**通过将 touch 或 wheel 事件标记为 `passive`，开发者承诺不会调用 `preventDefault` 来阻止滚动。** 这使得浏览器可以无需等待 JavaScript 执行而立即响应滚动，因此保证了用户能够得到顺滑的滚动体验。

## 特性检测

因为较旧的浏览器会将第三个参数中的任何对象解释为 `true` 来作为捕获参数，因此开发人员在使用这个 API 时应当进行特性行检测或 [polyfill](https://github.com/WebReflection/dom4) 来避免意外的结果。具体选项的特性检测可以这样进行：

```js
// 通过在 options 对象中定义一个 getter 方法来检测 passive 属性是否被访问到
var supportsPassive = false;
try {
  var opts = Object.defineProperty({}, "passive", {
    get: function () {
      supportsPassive = true;
    },
  });
  window.addEventListener("test", null, opts);
} catch (e) {}

// 使用检测结果。如果支持则使用 passive，否则将捕获设置为 false
elem.addEventListener(
  "touchstart",
  fn,
  supportsPassive ? { passive: true } : false
);
```

为了使它更简单，你可以使用 [Detect It](https://github.com/rafrex/detect-it) 提供的特征检测，例如：

```js
elem.addEventListener(
  "touchstart",
  fn,
  detectIt.passiveEvents ? { passive: true } : false
);
```

[Modernizr](https://modernizr.com/) 正在开发这项检测，但尚未发布。这里还有一个关于提供更简洁特性探测 API 的[公开的标准讨论](https://github.com/heycam/webidl/issues/107)。

## 消除取消事件的需求

在某些情况下，作者可能故意想要通过取消所有触摸或滚动事件来始终禁用滚动。包括：

- 平移和缩放地图
- 全页/全屏游戏

在这些情况下，当前的行为（阻止了滚动优化）是完全足够的，因为滚动自身一直会被阻止。在这些情况下没有必要使用被动事件监听器，不过使用 `touch-action: none` 这条 CSS 规则来明确你的意图仍然是一个好主意（例如支持具备 Pointer Events 但不具备 Touch Events 的浏览器）。

然而，在大多数常见的情况下，事件无需阻止滚动，例如：

- 用户活动监控，它只需要记录用户的最后一次活动时间
- `touchstart` 处理器来隐藏一些活动的 UI（例如提示框）
- `touchstart` 及 `touchend` 处理器来改变 UI 元素样式（避免取消 `click` 事件）

对于这些情况，只需要添加 `passive` 选项（以及适当的特性检测）而无需改动其他代码，就可以获得明显更加顺滑的滚动体验。

还有一小部分复杂情况，处理器只在特定条件下才会阻止滚动，例如：

- 水平滑动来旋转转盘、取消一个选项或打开一个 drawer，于此同时仍然允许垂直滚动。
  - 在这种情况下，使用 [`touch-action: pan-y`](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) 声明禁用沿水平轴开始的滚动而无需调用 `preventDefault()`（[测试页面](https://rbyers.github.io/touch-action.html)）。
  - 要继续在目前所有浏览器生效，调用 `preventDefault` 应该以对所使用的特定 `touch-action` 规则的缺乏支持为条件（注意 Safari 9 目前只支持 `touch-action: manipulation`）。
- 一个 UI 元素（例如 YouTube 的音量滑块），它只在水平滚动事件滑动，而不会改变垂直滚动事件的滚动行为。由于滚动事件没有提供 “`touch-action`” 这种选项，这种情况下智能使用非被动 wheel 监听器。
- 事件委托模式中，添加监听器的代码并不知道委托者是否要取消事件。
  - 这里的一个选择是分别对被动事件和非被动事件监听器进行委托（就好像他们是两种完全不同的事件类型）。
  - 也可以按照上面提到的使用 `touch-action`（把 Touch Events 当作 Pointer Events 对待）。

## 调试及衡量收益

你可以通过 chrome://flags/#passive-listener-default（Chrome 52 新增）配置浏览器强制将 touch/wheel 监听器当作被动的，从而可以快速了解可能的收益（以及潜在的破坏）。上述方法使得你可以轻松的像这个[热门视频](https://twitter.com/RickByers/status/719736672523407360)中一样进行并排比较。

要获得如何使用 Chrome 的开发者工具来标识阻止滚动的监听器的提示，请参阅[此视频](https://www.youtube.com/watch?v=6-D_3yx_KVI)。在一般情况下，你可以[监控事件时间戳](http://rbyers.net/scroll-latency.html)来测量滚动延迟，在调试时，可以使用 [Chromium 跟踪系统](https://www.chromium.org/developers/how-tos/trace-event-profiling-tool)查看 InputLatency 滚动记录。

Chrome 团队正在致力于提供 [Performance Timeline API](https://code.google.com/p/chromium/issues/detail?id=543598) 和更多 [DevTools 特性](https://code.google.com/p/chromium/issues/detail?id=520659)，以帮助 Web 开发人员更好地了解此问题。

## 减少和分解长时间运行的 JS 仍然至关重要

当一个页面显示出明显的滚动迟滞时，通常表示它某处存在着潜在的性能问题。 被动事件侦听器无法解决这些潜在问题，因此我们仍然强烈鼓励开发者确保其应用程序即使在低端设备上也符合 [RAIL 指南](https://developers.google.com/web/tools/chrome-devtools/profile/evaluate-performance/rail?hl=en)。如果你的站点存在每次运行时间大于 100ms 的逻辑，在响应触摸/点击仍然会感觉到延迟。从监视输入事件的愿望出发，被动事件监听器只允许开发者解决在滚动性能中反映出 JS 响应性的问题。 特别是第三方分析库的开发者现在可以有信心，他们的轻量代码并不会导致页面产生可以观察到的性能变化。

## 进一步阅读和讨论

有关详细信息，请参阅[此链接](https://github.com/WICG/EventListenerOptions)。如有任何问题或疑惑，请随时[向此 repo 提出 issues](https://github.com/WICG/EventListenerOptions/issues)，或联系 [@RickByers](https://twitter.com/RickByers/)。
