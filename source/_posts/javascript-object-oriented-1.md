---
title: Javascript 面向对象特性（1） —— 抛弃类
date: 2015-04-13 21:00:00
---

首先请不要怀疑 Javascript 是一门彻底面向对象的语言。Javascript 引擎启动的时候便会创建一个全局对象（在浏览器环境中就是我们熟悉的 `window` 对象）并向其中添加一些全局方法（例如 `alert` 方法）和全局属性（如 `document` 属性）。你所定义的变量、声明的方法只不过是这个全局对象的成员。

要把 Javascript 作为彻底面向对象的语言来认识，就必须抛开 Java、C# 这些经典面向对象语言的影响，因为你会发现 Javascript 中并不存在 `class` 关键字（但是由于 ECMAScript 把 `class` 作为保留字，所以你也不能将 `class` 用作变量名或函数名）。在这里，我们有必要重新认识面向对象：所谓面向对象，可以简单的理解为 **一切变量及函数都不能脱离对象而存在**。从这个角度看，Javascript 确实是一门彻底面向对象的语言，因为你的所有变量和函数都不可能脱离全局对象存在。

<!--more-->

其实，Javascript 中除了布尔、数字、字符串和数组这些原始类型成员（还包括 `null` 和 `undefined` 这两个特殊的原始值），其他成员（包括函数）都是对象类型。

## 创建对象

Javascript 中有两种方式来创建对象 —— **对象直接量** 和 **构造函数**。

你可以简单的通过一个对象直接量来构造一个对象，例如：

```js
var person = {
  name: "Zhang",
  age: 25,
  sayHello: function () {
    alert("Hello, I am " + this.name);
  },
};
```

就构造了一个 person 对象，通过这种方式进行对象构造，大多数基本的功能能够很优雅的实现。但当我们想创建 5 个 person 对象时，事情好像就麻烦起来。放心，Javascript 当然不会让你写 5 个对象直接量。为了完成这个任务，我们就要用到构造函数：

```js
function Person(pName, pAge) {
  this.name = pName;
  this.age = pAge;
  this.sayHello = function () {
    alert("Hello, I am " + this.name);
  };
}

var person1 = new Person("Zhang", 25);
var person2 = new Person("Wang", 26);
//...
```

构造函数就像一个工厂，给它提供不同的原料（参数），它就会按照一定的规则（函数定义）生产出产品（对象）。如果你愿意，完全可以把构造函数称为工厂函数。

在构造函数中，`this` 指代的是将要被构造出的对象（在创建构造函数的时候这个对象当然还不存在，所以这可能会有点难理解），对 `this` 对象进行的任何操作最终都会在构造出的对象上重现。另外，想要让构造函数工作起来就必须使用 `new` 关键字。构造函数配合 `new` 关键字，一个对象就被构造出来了。

目前为止看起来还不错。但是慢着，「Hello, I am someone」这个打招呼的方式看起来一点都不酷，我想改成「Hi, you can call me someone」。这时你会发现好像除了逐一修改所有对象没有别的办法，因为构造函数仅仅是一家工厂 —— 只负责生产而不负责服务，产品生产出来就和工厂完全没了关系。事实真的如此吗？当然不是！通过 Javascript 中的原型机制，我们可以使得工厂生产出的产品变得「可维护」。

## 原型

原型对象是构造函数中的一个属性（函数本身是一个对象，其属性也可以是对象），而且是一个非常特殊的对象 —— 在使用构造函数构造新对象时，原型对象会自动被构造出的新对象引用，这种引用方式非常特殊 —— 构造出的新对象可以直接访问其引用的原型对象中的属性，就如同访问自身的属性。我们把一个对象所引用的原型对象称为该对象的原型。有了原型，我们可以很方便的更新一个打招呼的方式：

```js
function Person(pName, pAge) {
  this.name = pName;
  this.age = pAge;
}

// 我们这次将 sayHello 函数定义在 Person 的 prototype 中
Person.prototype.sayHello = function () {
  alert("Hello, I am " + this.name);
};

var person = new Person("Zhang", 25);
person.sayHello(); // Hello, I am Zhang

// 修改原型对象中函数的定义
Person.prototype.sayHello = function () {
  alert("Hi, you can call me " + this.name);
};

person.sayHello(); // Hi, you can call me Zhang
```

通过上面这段代码，你可以更好的理解原型的含义：person 对象中并没有定义 sayHello 方法（因为这个方法没有在构造函数中定义）但却能够像访问自己的属性一样访问它，正是因为 person 对原型对象的特殊引用。

## 原型深入

Javascript 对象中使用一个名为 `[[Prototype]]` 的[内部属性](http://www.cnblogs.com/ziyunfei/archive/2012/10/30/2745786.html)来维护该对象对原型对象的引用。内部属性是指由 Javascript 引擎维护的对象属性，由双中括号标识。这些属性的存在是 Javascript 的规范，所以这些属性并不对外开放，用户无法直接读写这些属性。

在搜索对象成员时，Javascript 引擎会遵循下面的规则:

1. 搜索对象本身成员，如果存在则返回这个成员，如果搜索失败则执行第 2 步；
2. 搜索当前对象原型中的成员（该原型成为当前对象），如果搜索成功则返回这个成员，如果搜索失败则继续执行第 2 步进行递归搜索，直到某个对象没有原型，返回 `undefined`。

注意，这里不论最后返回的成员属于那个对象，其执行的上下文环境都是第一个对象。

虽然我们不能访问对象的 `[[Prototype]]` 内部属性，但很多 Javascript 引擎开放了一个名为 `__proto__` 的属性，这个属性与 `[[Prototype]]` 属性是等价的，所以我们可以通过这个属性来获取或设置一个对象的原型对象：

```js
var myPrototype = {
  name: "myPrototype",
  sayHello: function () {
    alert("I am " + this.name);
  },
};

var testPrototype = {
  __proto__: myPrototype,
  name: "testPrototype",
};

testPrototype.sayHello(); // I am testPrototype
```

可以看到，testPrototype 中虽然没有 sayHello 方法的定义，但由于通过 `__proto__` 属性为其设置了原型，testPrototype 就可以像调用自己的方法一样去调用原型中的方法。上面提到的 Javascript 引擎搜索对象成员的规则清楚的解释了整个过程是怎样进行的。需要注意的是：**`__proto__` 属性并不属于 Javascript 的语法标准，请不要在生产环境中使用它，Javascript 语法标准没有提供任何途径可以让我们操作一个对象的原型指向。**

Javascript 中所有对象都有原型：

```js
function Obj() {}

new Obj().__proto__ === Obj.prototype; // true
Object.__proto__; // function Empty () {}
Function.__proto__; // function Empty () {}
(Object.__proto__ ===
  Function.__proto__(
    // true
    {}
  ).__proto__) ===
  Object.prototype; // true
Object.prototype.__proto__; // null
```

其中所有由构造函数构造的对象的原型就是构造函数的 prototype 对象，所有[本地对象](http://www.w3school.com.cn/js/pro_js_object_types.asp)的原型是一个空函数（`function Empty () {}`），其余所有对象的原型都是 `Object.prototype`，而 `Object.prototype` 的原型是 `null`。

根据上面的解释，我们不难理解正常情况下 Javascript 中所有对象都可以访问 toString 方法，因为这个方法被定义在 `Object.prototype` 中。例如使用原型完成的 person 对象，其调用 toString 方法的途径可以用下图表示：

![原型链](/diagrams/prototype-chain.png)

我们把类似上面这样一条包含两个或多个原型对象的链式结构称作 **原型链**。Javascript 引擎搜索对象成员的过程可以概括为在原型链上的搜索。需要注意的是，原型链是单向的，也就是说：链尾端的对象可以向上访问其原型及原型的原型中的成员，但原型对象无法访问到后代对象中的成员。另外，按照前面阐述的对象成员搜索规则，Javascript 总是会接受第一个找到的成员，也就是说原型链中的同名成员只有最尾端的生效，这个特征称为 **属性隐藏**。

## 小结

Javascript 中面向对象的实现确实需要一点时间来好好理解，就我而言这其中最难理解的部分其实是如何理清原型、原型属性、原型对象这三个概念。

原型属性是函数对象的一个默认属性（这个属性是由函数对象的构造函数 —— Function 初始化的），它指向一个对象 —— 原型对象。大多数时候我们并不需要区分原型属性和原型对象这两个概念。而这三个概念中最复杂的关系莫过于 —— **构造函数的原型对象不是构造函数的原型，而是由构造函数构造出的对象的原型。**另外，请不要试图将「原型」同 Java 中的「静态属性」、「继承」等语言特性进行类比，他们虽然表面上有一定联系，但总的来说异大于同。如果非要对「原型」这一语言特性做一个通俗的解释，我更倾向于把它解释为「共享属性」。能够准确理解以上几点，可以说你已经很好的掌握了 Javascript 面向对象的特性。

Javascript 面向对象的主要语言特性到这里已经讲告一段落了，但你可能已经发现了 Javascript 中并没有一种语言特性来显式的完成继承，实现属性保护（私有属性）等特性也更是无从谈起。其实这点并不难解释：Javascript 诞生的最初目的仅仅是为了完成类似表单校验这样简单的任务，它的设计者怎么也不会想到若干年后 Javascript 会如此繁荣，甚至已经被扩展成了后端语言（Node.js），Javascript 程序的复杂度与早已不能同表单校验程序同日而语。当初为简单需求设计的 Javascript 语言特性在复杂的需求面前难免显得捉襟见肘。

为了完成更复杂的程序功能，程序设计者充分利用了 Javascript 的语言特性，巧妙的实现了继承、私有属性等特征，这使得 Javascript 面向对象的特性得到极大丰富，这部分内容会在[下一篇文章](/javascript-object-oriented-2)中进行介绍。

## 延伸阅读

1. [JavaScript 对象](http://www.w3school.com.cn/js/js_objects.asp)
2. [Does JavaScript need classes?](http://www.nczonline.net/blog/2012/10/16/does-javascript-need-classes/)（[[译] JavaScript 需要类吗?](http://www.cnblogs.com/ziyunfei/archive/2012/10/17/2727121.html)）
3. [How does JavaScript .prototype work?（来自 StackOverflow 的解答）](http://stackoverflow.com/questions/572897/how-does-javascript-prototype-work)

## 修订历史

1. 2016-02-04：代码格式化
2. 2017-02-18：格式修订
