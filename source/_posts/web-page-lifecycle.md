---
title: Web 页面生命周期
date: 2020-02-16 11:00:00
---

一个 Web 页面的生命周期指的是页面从开始加载到完全卸载的过程中经历的所有状态及状态转化，主要包括了焦点、可见性、页面缓存等内容。Web 页面的完整生命周期所有的状态及状态转化可以参考下图：

![](/usr/uploads/page-lifecycle.png)

图片来源：[Page Lifecycle API | Web | Google Developers](https://developers.google.com/web/updates/2018/07/page-lifecycle-api)，内容进行了翻译。由于原图属于草案内容，本图中部分流程根据目前浏览器的实际表现进行了调整。

## 生命周期

### 焦点变化

焦点变化会导致页面在 active 和 passive 两个状态间切换，可以使用 `document.hasFocus()` API 来得到页面当前的状态。在焦点状态发生变化时，还会在 `window` 上触发 `focus` 或 `blur` 事件。

### 可见性变化

页面的可见性是指页面当前是否在前台展示，包括 visible 和 hidden 两个状态，可以使用 `document.visibilityState` API 来进行判断。visible 指的是当前页面在前台展示，需要注意的是页面在前台不等同于用户一定可以看到页面，例如在基于视窗的操作系统中，浏览器视窗被移动到可视区域外，或浏览器视窗被其他视窗覆盖时，此时的可视性仍然为 visible。一般在浏览器最小化，或用户切换至其他浏览器标签页时，可见性状态才会变成 hidden。页面的可见性发生变化时，将会在 `document` 上触发 `visiblilitychange` 事件。

在 hidden 状态下，浏览器会根据系统资源情况对页面功能进行不同程度的限制：

- 首先，UI 的刷新频率可能会降低甚至完全停止 UI 刷新，这表示 `requestAnimationFrame` 回调可能延迟或暂停；
- 其次，为了进一步的释放资源，页面可能会被冻结（frozen），这时所有的脚本执行会受到限制；
- 最后，浏览器会根据策略将长时间没有恢复（resume）的冻结页面直接销毁（discard），若用户重返页面，则会重触发重新加载；

### 冻结

页面的生命周期中有 2 种场景可能进入冻结状态，一种是上面提到过的将 hidden 状态的页面冻结以释放系统资源；另一种则是用户在进行前进/后退的导航操作时，为了快速的进行页面切换对页面进行缓存冻结。

frozen 状态的页面几乎无法进行任何操作，并且进入 frozen 状态的页面可能永远不会被恢复而直接被销毁。最新的生命周期 API 提供的 freeze 事件可以供将要进入 frozen 状态的页面进行一定的准备工作（目前仅 Chrome 68+ 支持这一 API），但事件回调函数的执行资源也会被限制。因此目前最安全的方式仍然是使用 visibility API 处理相关工作。

### 卸载

一个处在 active 状态页面卸载的过程中会依次触发 `beforeunload`、`pagehide`、`visibilitychange`（当前状态不为 hidden 时），其中 `beforeunload` 是在卸载过程中最后一个可以取消的事件。如果浏览器准备缓存当前页面（关于页面缓存的详细内容可以参考[Webkit 页面缓存 I——基础](https://webkit.org/blog/427/webkit-page-cache-i-the-basics/)或[使用 Firrefox 1.5 缓存](https://developer.mozilla.org/zh-CN/docs/Mozilla/Firefox/Releases/1.5/Using_Firefox_1.5_caching)），那么会向 `pagehide` 事件传递 `event.persisted = true` 的参数，页面最终会抵达 frozen 状态；如果浏览器不缓存当前页面，则继续触发 `unload` 事件最终抵达 terminated 状态。

## `freeze`、`resume` 及 `document.wasDiscarded`

上面的图中可以看到，frozen 和 discarded 两个状态是由浏览器触发的，开发者无法获知这些状态转化。在新的页面生命周期 API 中（Chrome 68+），添加了 `freeze`、`resume` 事件以及 `document.wasDiscarded` 属性。两个事件能够让开发者在页面被冻结和被恢复时感知到状态变化，`document.wasDiscarded` 属性则可以让开发者在页面加载时检查页面状态作出对应的响应（如恢复被 discard 之前的页面持久化的状态等）。

## 最佳实践

### 始终考虑 frozen 和 discarded 状态

在大量的移动设备以及部分桌面设备上，浏览器开始更加积极的进行资源调度优化，以便更有效的使用系统资源保证良好的用户体验。因此页面进入 frozen 或 discarded 状态是一个在开发时必须考虑的场景。一般来说，你应该在页面进入 frozen 状态前对页面上的重要数据进行持久化。在 Chrome 中，可以方便的使用 `chrome://discards` 来测试页面在 frozen 和 discarded 状态下的表现。

### 使用 visibility API 完成必要的工作

考虑到 `freeze` 事件还没有部署到主流浏览器，hidden 状态可能是开发者能够感知的最后一个页面生命周期。在这一阶段应当首先要停止不必要的 UI 更新、定时器或网络通信，最大限度的减少资源占用；更重要的是进行必要的页面状态持久化，避免用户数据的丢失。

### 限制使用 `beforeunload` 事件，停止使用 `unload` 事件

由于 `beforeunload` 和 `unload` 事件往往用来停止页面的某些功能，页面缓存会在绑定有这两个事件时不可用。因此在页面上应该限制 `beforeunload` 事件的使用，最佳的做法是在只在有未持久化的状态时绑定 `beforeunload` 事件，持久化完成后立即解绑。而对于 `unload` 事件，在现代浏览器上应当全部使用 `pagehide` 事件取代，并对应的使用 `pageshow` 事件（检测 `event.persisted`）来处理缓存页面恢复的场景。针对这部分内容的更详细解读，可以参考[Webkit 页面缓存 II——卸载事件](https://webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/)。
