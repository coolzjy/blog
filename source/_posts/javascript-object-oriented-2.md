---
title: Javascript 面向对象特性（2） —— 找回类
date: 2015-04-16 22:00:00
---

虽然没有类的概念使得 Javascript 的面向对象特性更加彻底，也能够很方便的实现基本的网页交互需求。但仅通过构造来创建对象使得代码的复用性非常弱，在很多复杂应用中也不能进行模块化编程。所以抖机灵的程序猿想方设法利用 Javascript 的语言特性来模仿「类」的概念（就如同他们在 iOS 平台上通过把骚扰电话全都保存在通讯录里来标识骚扰电话一样）。这篇文章介绍了常见的面向对象特性在 Javascript 中的实现。

<!--more-->

**注 1：这部分需要 Javascript 面向对象的语言特性作为支撑，如果你对这些内容还不熟悉，请参考[前一篇文章](/javascript-object-oriented-1)。**

**注 2：以下内容基于的是 ECMAScript 3 语法标准，已经推出的 ECMAScript 5 及正在修订的 ECMAScript 6 中添加了更多面向对象的新特性。**

## 构造函数和原型链

Javascript 语言特性中的构造函数本就是用来构造对象的，这与类的作用十分相似，因此使用构造函数来模拟类成为一种很通用的做法（某些书中直接把构造函数称作类，我个人完全不能接收这种说法）：

```js
function Person(pName, pBornYear) {
  this.name = pName;
  this.bornYear = pBornYear;
}

// 需要共享的属性和方法写在原型中
Person.prototype.getAge = function () {
  return new Date().getFullYear() - this.bornYear;
};
```

然后使用 `new` 关键字进行「实例化」：

```js
var person = new Person("Brendan", 1961);
alert(person.getAge());
```

如果你对原型（prototype）还不了解，可以参见[前一篇文章](/javascript-object-oriented-1)中的相关介绍。由于构造函数的写法过于松散，就出现了下面这种改进：

```js
function Person(pName, pBornYear) {
  this.name = pName;
  this.bornYear = pBornYear;

  var proto = Person.prototype;

  // 如果构造函数的原型对象未初始化，则初始化原型对象
  if (!proto.inited) {
    proto.getAge = function () {
      return new Date().getFullYear() - this.bornYear;
    };
    proto.inited = true;
  }
}
```

上面这段代码中，向原型中添加成员的代码被转移到构造函数中，而为了避免每次调用构造函数时原型对象成员重复初始化造成浪费，使用一个判断条件使得原型对象成员的初始化只执行一次。

完成了类的定义，下面我们需要实现继承这一特性，Javascript 中的原型链可以帮助我们实现继承：

```js
function Person(pName, pBornYear) {
  this.name = pName;
  this.bornYear = pBornYear;

  var proto = Person.prototype;

  // 如果构造函数的原型对象未初始化，则初始化原型对象
  if (!proto.inited) {
    proto.getAge = function () {
      return new Date().getFullYear() - this.bornYear;
    };
    proto.inited = true;
  }
}

function Men(pName, pBornYear) {
  this.name = pName;
  this.bornYear = pBornYear;
  this.shave = function () {
    alert("shaving");
  };
}

Men.prototype = new Person(null, null);

var men = new Men("Brendan", 1961);
alert(men.getAge());
men.shave();
```

我们通过扩展原型链，将 Men 的原型属性指向 Person 的实例化对象，使得 Men 的实例化对象能够访问 Person 实例化对象的全部成员，实现了 Men 对 Person 的继承。如果你不能理解原型在其中是如何工作的，仍然可以参见[前一篇文章](/javascript-object-oriented-1)中的相关介绍。下面这张图可以帮助你更好的理解上面这段代码：

![扩展的原型链](/diagrams/extended-prototype-chain.png)

在上面的代码中我们在 Men 构造函数中重新定义了 name 和 bornYear 两个属性，而 Person 中的 name 和 bornYear 两个属性被赋值为 `null`，根据原型链中属性隐藏的特性，men 对象中的属性会覆盖掉 person 对象中的属性。你也许想到了更好的做法：

```js
function Men(pName, pBornYear) {
  this.shave = function () {
    alert("shaving");
  };

  Men.prototype = new Person(pName, pBornYear);
}
```

**但是请注意，上面这种用法是完全错误的！因为在构造函数中修改 prototype 属性的指向不会在实例化对象中生效！**

由于在构造函数中改变 prototype 属性的指向是无效的，所以基于原型链的继承最大的缺陷就在于父类的构造函数不能含有参数。

### 极简主义法

这个方法是在《Javascript 定义类（class）的三种方法》一文中读到的。相比于构造函数的方法，极简主义法拥有更加清晰的调理和更加紧凑的结构：

```js
var Person = {
  create: function (pName, pBornYear) {
    var obj = {};
    obj.name = pName;
    obj.bornYear = pBornYear;
    obj.getAge = Person.getAge;
    return obj;
  },
  getAge: function () {
    return new Date().getFullYear() - this.bornYear;
  },
};
```

调用 create 方法，就可以实例化生成一个对象：

```js
var person = Person.create("Brendan", 1961);
alert(person.getAge());
```

极简主义法除了更加清晰紧凑，还更容易部署面向对象的特性。例如在子类的 create 方法中调用父类的 create 方法就完成了继承：

```js
var Men = {
  create: function (pName, pBornYear) {
    var obj = Person.create(pName, pBornYear);
    obj.shave = function () {
      alert("shaving!");
    };
    return obj;
  },
};

var men = Men.create("Brendan", 1961);
alert(men.getAge());
men.shave();
```

可以看到，极简主义方法能够很方便的实现继承，并且不存在原型链方法中父类构造函数不能含有参数的问题。

## 属性隐藏

面向对象的另一个重要特性就是成员隐藏，或者称作私有成员。然而 Javascript 的语法特性完全没有涉及成员隐藏，为了实现这一特性，**我们使用 Javascript 中唯一的作用域 —— 函数作用域来构造一个不能被外部访问的作用域空间，用来保存私有成员，同时提供一个访问途径。**这就是闭包的概念。

通过下面代码，我们可以将 Person 类中的 bornYear 属性保护起来，同时只提供一个计算年龄的函数 getAge 来完成对属性的访问：

```js
function Person(pName, pBornYear) {
  this.name = pName;
  this.getAge = function () {
    return new Date().getFullYear() - pBornYear;
  };
}

var person = new Person("Brendan", 1961);
alert(person.bornYear); // undefined
alert(person.getAge());
```

上面的代码中涉及到了三个作用域，最外层的全局作用域，构造函数 Person 的作用域以及 getAge 对应的匿名函数形成的作用域。当构造函数调用完毕之后，本应销毁的作用域由于存在匿名函数对 pBornYear 引用而被保留下来，形成一个闭包。pBornYear 做为闭包变量则只能通过 getAge 才能访问，这一属性就被隐藏起来。

## 小结

Javascript 独特的面向对象形式使得很多面向对象的特性的实现必须「曲线救国」，而没有办法像 Java 或 C# 这些语言来的这么爽快。但另一方面也是因为这种形式使得 Javascript 程序风格异常灵活，如果你很好的掌握了 Javascript 的语言特性，完全可以巧妙的利用这些特性写出令人惊叹的程序。

Javascript 中实现面向对象特性的方法多种多样，这里只简单介绍了两种比较通用的方法。如果你已经很好的理解了 Javascript 的语言特性，完全可以写出自己的实现方法。最后对 Javascript 中的一个重要概念 —— 闭包做了简单介绍，如果你还对闭包有些疑问，可以参考延伸阅读中的文章。

## 延伸阅读

1. [Javascript 定义类（class）的三种方法](http://www.ruanyifeng.com/blog/2012/07/three_ways_to_define_a_javascript_class.html)
2. [理解 Javascript 的闭包](http://coolshell.cn/articles/6731.html)
3. [全面理解面向对象的 Javascript](http://www.ibm.com/developerworks/cn/web/1304_zengyz_jsoo/)

## 修订历史

1. 2015-09-04：抛弃 `with` 语句段
2. 2016-02-04：代码格式化
3. 2017-02-18：更新代码 格式修订
