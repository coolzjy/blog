---
title: 初识 React
date: 2015-09-03 09:20:00
---

<!--more-->

## 1 JSX

JSX 是一种语法糖，是 JavaScript 和 HTML 的结合体，你可以将它类比于 CSS 预编译体。JSX 的目标是在 JavaScript 中更加方便的创建 HTML 节点（更严谨的说法是 React virtual DOM 节点）。JSX 经过解释器解释，最终呈现标准的 JavaScript 语法，所以 JSX 并没有创造新的语言。例如在 React 中，下面的 JSX 代码：

```js
return <div className="commentBox">Hello, world! I am a CommentBox.</div>;
```

将被解释为如下代码：

```js
return React.createElement(
  "div",
  { className: "commentBox" },
  "Hello, world! I am a CommentBox."
);
```

可以看到，解释器会分析 JSX 的语义并将其转化为创建元素的方法，而并非将 HTML 部分当作简单的字符串原样输出，因此不用担心 JSX 会引发 XSS。另一方面，由于 HTML 部分不是被当作字符串处理，JSX 中 HTML 元素的部分写法与标准 HTML 有些许出入，这一点可以参考[这里](http://facebook.github.io/react/docs/jsx-in-depth-zh-CN.html)。

另外需要注意的是：由于一条 JSX 语句只能够创建一个虚拟 HTML 节点（虚拟 HTML 节点将会在后面谈到），因此 **JSX 语句中至多拥有一个根 HTML 节点**。下面的 JSX 就无法完成解释：

```js
return (
  <h1>Main Title</h1>
  <h2>Sub Title</h1>
)
```

## 2 组件

组件是 React 最基本的渲染单位，React 中全是模块化、可组装的组件。组件的嵌套和拼装组成了整个页面。JSX 语法可以让组件的构建更加方便，但 JSX 绝对不是 React 的核心，正如在上面章节提到的，你可以使用 JSX 语法来描述一个组件，如果不使用 JSX，你可以直接使用 React 的方法来构建组件。每个组件拥有自己的属性（props）和状态（state）（属性和状态的区别会在后面讲到），通过属性赋值和状态修改，React 就可以实现整个页面的呈现和交互。

## 3 为什么不用 `document.createElement`

我们都知道，JavaScript 通过 DOM 实现与 HTML 的交互，然而我们在 React 中构造一个元素却调用了 `React.createElement` 方法，表面上看同样是生成一个 DOM 对象，那么为什么不使用 `document.createElement` 方法呢？原因就在于 `React.createElement` 方法并没有真正生成一个 DOM 对象，而是生成了一个虚拟的 DOM 对象，这也是 React 的核心思想所在。React 中的所有操作都是对虚拟 DOM 而不是对真实 DOM 的操作。所以 React 的状态修改不会实时体现在页面上，而是在整个组件渲染时，React 会比较组件的状态改变，仅将发生改变 DOM 进行重绘，虽然看起来这个过程十分复杂，但实践证明这一机制确实能够提高页面渲染效率。这正是 React 高效的秘诀之一。

## 4 组件入门

### 4.1 第一个组件

第一次使用 React，只需要在我们的 HTML 中引入下面两个 JavaScript 文件：

```html
<script src="http://cdn.staticfile.org/react/0.12.0-rc1/react.js"></script>
<script src="http://cdn.staticfile.org/react/0.12.0-rc1/JSXTransformer.js"></script>
```

其中第一个文件是 React 框架，第二个是 JSX 语法的解释器，用来将 JSX 语法解释成 JavaScript 语句（注意解释 JSX 语法是非常占用资源的，正式开发中 JSX 都是在服务器端预先解释为 JavaScript）。另外，由于不是标准的 JavaScript 语法，我们的代码不能在普通的 script 标签中书写，这里需要给 script 标签添加 `type="text/jsx"` 属性，并将我们的代码写在这个 script 标签中：

```html
<script type="text/jsx">
  // code here
</script>
```

下面我们使用 `React.createClass` 方法生成一个组件，方法会直接返回一个组件构造函数，组件构造函数必须被保存在以大写字母开头的变量中才可以被正常调用：

```js
var MyComponent = React.createClass({
  render: function () {
    return <h1>My First Component</h1>;
  },
});

React.render(<MyComponent />, document.body);
```

作为 `createClass` 方法参数的对象，其属性和方法将会被添加到组件中，这其中 `render` 方法是每个组件必须的，组件根据这个方法的返回值进行渲染。组件声明后就可以用 HTML 的语法来调用：

调用 React 组件必须闭合标签，如果组件没有子元素，推荐使用自闭合标签。组件声明时可以嵌套其他组件：

```js
var AnotherComponent = React.createClass({
  render: function () {
    return (
      <div>
        <MyComponent />
        <p>I'm Zhang</p>
      </div>
    );
  },
});
```

使用 React 声明一个组件就是这么简单，JSX 语法使得这项工作与直接书写 HTML 代码一样方便。我们需要把更多精力放在如何划分组件这个问题上：一般情况下，我们的原则是 **一个组件就是能够独立完成一项功能的最基本单位**。譬如：一个标签和一个文本框可以作为一个组件 —— 完成引导用户输入的功能。另外一个原则是 **良好的可复用性**，如果你定义的组件只能适应一种应用场景，那么就有必要重新对你的组件进行一番审视了。

### 4.2 可复用组件 —— props

仅仅渲染静态的 HTML 显然不能使组件复用，要让组件工作在不同场景下就需要为组件暴露接口，React 中 props 完成了这项功能：

```js
var ReusableComponent = React.createClass({
  render: function () {
    return <h1>Hi, {this.props.name}! Welcome to React world.</h1>;
  },
});
```

在声明组件时，我们在渲染模板中埋入了一个 JavaScript 变量 `this.props.name`，在组件调用时就可以使用标签属性来为这个变量赋值：

```js
React.render(<ReusableComponent name="Zhang" />, document.body);
```

组件对象的 props 属性是所有传入组件值的集合对象。在 React 中不仅可以给组件传递基本类型的值，还可以传递对象或数组，并且当向一个组件传递一个元素数组时，React 会自动在属性调用位置展开该数组，渲染数组中的所有元素：

```js
var ArrayPropsComponent = React.createClass({
  render: function () {
    return (
      <hgroup>
        {/* 将字符串数组扩展为元素数组 */}
        {this.props.names.map(function (name) {
          return <h1>Hi, {name}! Welcome to React world.</h1>;
        })}
      </hgroup>
    );
  },
});

React.render(<ArrayPropsComponent names={["Zhang", "Wang"]} />, document.body);
```

灵活使用 React 中 props 数组展开这一特性我们可以很方便的将接口数据呈现为表格、列表等形式，而不必再用多余的代码进行循环操作。props 的默认值由 getDefaultProps 方法提供，这个方法在组件的生命周期（后面会详细说明）中只进行一次调用，方法要求返回一个对象，该对象中的所有成员将被添加到组件的 props 中：

```js
var ReusableComponent = React.createClass({
  getDefaultProps: function () {
    // 为组件提供缺省的 props
    return { name: "Zhang" };
  },
  render: function () {
    return <h1>Hi, {this.props.name}! Welcome to React world.</h1>;
  },
});

// 调用时不提供 props 也不会报错
React.render(<ReusableComponent />, document.body);
```

### 4.3 动态化的组件 —— state

目前为止，我们已经可以通过 props 来创建多样化的组件，但是你很快就会发现仅凭 props 无法与用户进行动态交互。React 提供了 state 来完成这一任务，state 可供开发者储存组件运行时动态生成的数据，这些数据一般来自用户交互或服务器数据：

```js
var DynamicComponent = React.createClass({
  getInitialState: function () {
    return { text: "" };
  },

  handleChange: function (e) {
    this.setState({
      text: e.target.value,
    });
  },

  render: function () {
    return (
      <div>
        <label htmlFor="text">Input some text:</label>
        <input id="text" type="text" onChange={this.handleChange} />
        <br />
        <label htmlFor="result">Your text is:</label>
        <input id="result" type="text" readOnly value={this.state.text} />
      </div>
    );
  },
});

React.render(<DynamicComponent />, document.body);
```

上面的例子展示了 React 获取用户输入并做出响应的过程，这其中要特别注意 getInitialState 和 setState 两个方法。getInitialState 方法和 getDefaultProps 方法类似，它用来给组件提供初始的 state，组件加载时将会调用这个方法以保证渲染时能够读取 state；setState 方法用来更新组件的 state 并对 DOM 发生改变的部分进行重新渲染，因此无论如何不要绕开 setState 方法向组件的 state 属性中写入数据，这样 React 就无法保证界面和数据的一致性。

### 4.4 事件支持

React 对于常见的事件有良好的支持，符合 W3C 时间模型并且不存在浏览器兼容性问题。在上面的例子中我们已经用到了 onChange 事件，除此之外 React 还实现了对剪贴板事件、键盘事件、鼠标事件、表单事件、触控事件等事件的支持，详细的事件列表可以参考[这里](http://facebook.github.io/react/docs/events-zh-CN.html)。React 事件系统有两个特点需要特别注意：首先，React 使用的是事件代理的形式，也就是目标节点并没有绑定事件处理程序，所有的事件处理程序都绑定在根节点上；其次，所有的事件处理程序都会自动绑定到当前组件，也就是说事件处理程序中的 `this` 指向当前组件的实例而非事件目标节点。

## 5 一点点深入

### 5.1 props v.s. state

正如你看到的，React 中 props 负责数据呈现，state 负责数据交互。数据应该放在 props 中还是 state 中是使用 React 进行开发时必须掌握的内容，React 官方文档中关于如何选择 props 和 state 有下面的描述(参见[这里](http://facebook.github.io/react/docs/interactivity-and-dynamic-uis-zh-CN.html))：

> 大部分组件的工作应该是从 props 里取数据并渲染出来。但是，有时需要对用户输入、服务器请求或者时间变化等作出响应，这时才需要使用 state。

具体来说，React 官方文档给出了下面建议：

- 尝试把尽可能多的组件无状态化
- state 应该包括那些可能被组件的事件处理器改变并触发用户界面更新的数据
- 计算得到的数据、React 组件以及基于 props 的重复数据不应当作为 state

### 5.2 组件的生命周期

React 呈现页面的过程其实就是一个个 React 组件「加载 - 更新 ··· 更新 - 卸载」的过程，React 为开发者提供了生命周期方法，用以在组件的特定生命周期执行特定的代码，这些方法包括：

- componentWillMount：组件加载之前调用，整个组件的生命周期中只会调用一次。此时可以访问到组件初始的 props 和 state，并且在这个方法中操作 state 会直接反映在接下来的组件渲染中而不是再次更新组件，此时还不能访问 DOM。
- componentDidMount：组件加载完成后调用，此时可以访问到 DOM。
- componentWillRecieveProps：组件 props 更新前调用，将要更新的 props 将会作为该方法的参数。
- shouldComponentUpdate：组件将要更新时调用，新的 props 和 state 将会作为该方法的参数，该方法应当返回一个布尔值指示更新操作是否应当继续进行，首次加载时不会调用该方法。
- componentWillUpdate：组件更新之前调用，新的 props 和 state 将会作为该方法的参数，该方法中不能修改组件的 state（否则可能导致组件连续更新），首次加载时不会调用该方法。
- componentDidUpdate：组件更新完成后调用，旧的 props 和 state 将会作为该方法的参数，此时可以访问到更新后的 DOM。
- componentWillUnmount：组件卸载之前调用，此处应该进行组件使用资源的清理工作。

上面的 7 个生命周期方法连同 getDefaultProps、getInitialState 和组件必需的 render 方法构成了一个组件的基本 API。

## 6 避坑 Tips

- 不要在 componentWillUpdate 中更新 state！不要在 componentWillUpdate 中更新 state！不要在 componentWillUpdate 中更新 state！重要的事情说三遍。你要问为什么？因为更新 state 会导致组件更新进而调用 componentWillUpdate 方法，componentWillUpdate 中更新了 state，更新 state 又会导致组件更新而调用 componentWillUpdate 方法……所以你懂了。
- 除了需要操作 DOM 的初始化操作全部丢到 componentWillMount 中进行，特别是涉及修改 state 的操作。因为这些方法如果丢到 componentDidMount 中，会导致组件加载完成后立刻检测到 state 变更，触发组件再次更新，影响页面性能。
- 不要在 getDefaultProps 中进行任何针对实例的操作。因为这个方法仅会在类创建后执行一次，返回值会被缓存起来用在所有实例上，在该方法中访问不到任何组件实例。
- 一定要在 componentWillUnmount 中做好清理工作，否则你会面临一大堆不可预测且难以调试的 Bug。
