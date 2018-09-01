---
title: 「Javascript 语言核心」学习笔记
date: 2015-04-11 19:30:00
---

## 1 语法结构

- Javascript 程序是用 Unicode 字符集编写的。
- Javascript 是区分大小写的语言。
- Javascript 中可以使用 `\uFFFF` 的形式来进行 Unicode 转意，这种写法可以出现在 Javascript 字符串变量、正则表达式及标识符中。
- Javascript 中的直接量包括各种类型数据值、对象及数组。

<!--more-->

## 2 类型、值和变量

- Javascript 的数据类型分为原始类型和对象类型。
- 原始类型包括数字、字符串、布尔值，以及 `null` 和 `undefined`。
- 对象是属性的集合，每个属性都由键值对构成，数组和函数都是特殊对象。
- 数组是一种带编号的值的有序集合，函数是具有与他相关联的可执行代码的对象。
- 用来初始化一个对象的函数叫做构造函数。

### 2.1 原始类型

- 所有数字均用浮点数值表示。
- `Infinity` 和 `NaN` 是 Javascript 中预定义的两个全局变量。
- `Infinity` 和 `NaN` 与任何值都不相等，包括其自身。需要使用函数 `isFinite` 及 `isNaN` 来判断是否为非数字值。
- 浮点运算会产生精度问题，如 `(0.3 - 0.2) == (0.2 - 0.1)` 会返回 `false`，因此在进行金融计算等任务时，要使用最小计量单位做整数运算。
- `Str[0]` 等价于 `Str.charAt(0)`。
- `/Some code/[i,g]` 定义了一个正则表达式直接量。
- 任意 Javascript 值都可以转换为布尔值，除了 `undefined`、`null`、`0`、`-0`、`NaN`、`""`（空字符串）会被转换成 `false`，其他所有值都会被转换成 `true`。
- `null` 表示对象无值，而 `undefined` 表示对象未初始化，`null == undefined` 但 `null !== undefined`。

### 2.2 对象类型

- 全局对象是 Javascript 解释器启动时创建的一个对象，其中包含一组定义的初始属性。除了初始属性，如果代码声明了一个全局变量，这个全局变量也会作为全局对象的一个属性。
- 可以使用 `this` 关键字在代码的最顶层引用全局对象。
- 数字、字符串及布尔值所具有的方法是来自 `Number`、`String` 及 `Boolean` 构造函数所创建的一个临时对象，这类对象称为包装对象。`null` 和 `undefined` 没有包装对象，因此访问他们的属性会抛出一个类型错误。
- 包装对象在使用后随即销毁，因此为其属性赋值不能被保留下来，同时其初始属性也都是只读的。
- 可以通过 `new Number()`、`new String()` 及 `new Boolean()` 来显式创建包装对象，Javascript 会在必要时将包装对象转换为其原始值。
- 原始类型的比较是值的比较：数值相等则相等，而对象的比较是引用的比较：当且仅当它们引用同一个基对象时，他们才相等。

### 2.3 类型转换

- Javascript 会自动将你提供的类型转换为其需要的类型。
- `toFixed`、`toExponential` 及 `toPrecision` 三个方法是 `Number.prototype` 上定义的用于将数字类型转换为字符串类型定义的方法。
- `parseInt` 及 `parseFloat` 方法用于将字符串类型转换为数字类型。
- 对象转换为原始值的方法包括 `toString` 和 `valueOf`，如果这两个方法都不能返回一个原始值，Javascript 将会抛出一个类型错误异常。
- `+` 运算符将对象转换为字符串，而 `-` 运算符将对象转换为数字。

### 2.4 变量及作用域

- 声明但未使用的变量，其初始值就是 `undefined`。
- 给一个未声明的变量赋值，虽然不会报错，但这是一个不好的习惯并会造成很多 Bug。
- 函数体内局部变量的优先级高于全局变量，函数体内的所有变量在整个函数体生效，而非代码段，这个特性被称为声明提前。
- 创建全局变量等同于创建一个不可配置的全局属性。
- 当定义一个函数时，它实际上保存一个作用域链。当调用这个函数时，它创建一个新的对象来存储它的局部变量，并将这个对象添加至保存的那个作用域链上，同时创建一个新的更长的表示函数调用作用域的「链」。

## 3 表达式和运算符

- 直接量、变量、数组及函数调用都属于表达式，将简单表达式组合成复杂表达式的最常用方法是使用运算符。
- 数组元素中可以包括 `undefined`。
- 对象属性名可以是变量名（标识符），也可以是字符串。
- 函数表达式的值是 `return` 语句给出的，如果函数中不存在 `return` 语句，则函数表达式的值为 `undefined`。
- 方法调用中访问的属性是本对象（`this`）的属性。
- `new` 关键字会创建一个空对象，然后 Javascript 通过传入指定的参数并将这个对象作为 `this` 的值来调用构造函数，构造函数即可创建 `this` 对象的属性。
- 如果构造函数没有返回值，由 `new` 构造的对象就是表达式的值；如果构造函数返回了一个对象值，那么这个对象就是整个表达式的值。
- 属性访问表达式和调用表达式的优先级要比所有运算符都高。
- 要注意任何具有副作用的表达式（如包含 `--`、`++`、`delete` 等赋值操作运算符的表达式）对其他表达式的影响。
- `in` 运算符返回一个对象是否拥有一个属性，`instanceof` 运算符返回对象是否属于一个类，其右操作数是一个构造函数。
- `&&`（或 `||`）运算符只会返回第一个类型转换后为 `false`（或 `true`）的表达式的值，而非 `true` 或 `false` 两个值。
- `!` 运算符会首先将操作数转换为布尔型，因此其返回结果总是 `true` 或 `false`。
- `eval` 只有一个参数，如果传入的参数不是字符串，它直接返回这个参数。如果是字符串并编译成功，则执行返回语句中最后一个表达式或语句的值。
- `eval` 调用了它的变量作用于环境，即它运行的代码中查找变量和定义变量的操作与其本身在同一作用域中。
- 直接调用 `eval` 时，它总在调用它的上下文作用域执行，而间接调用则会在全局作用域内执行，且无法访问局部属性。
- 通过 `delete` 删除数组元素不会改变数组长度。

## 4 语句

- Javascript 中没有块级作用域，在语句块中声明的变量并不是语句块私有的，同时需要注意声明提前的情况。
- 函数声明语句通常出现在 Javascript 代码的最顶层，也可以嵌套在其它函数体内，但不能出现在其他任何语句中。
- 使用 `var` 和 `function` 定义函数的区别在于 `var` 只是声明提前而 `function` 则是声明和定义同时提前。
- 所有判断分支都依赖同一个表达式的值，使用 `switch` 而非 `else if` 可以避免表达式的重复计算。
- `switch` 表达式和 `case` 条件是按照 `===` 运算符进行比较的。
- 使用 `for in` 循环进行对象属性枚举时，按照属性定义的顺序进行枚举。但当对象具有整数索引时，则会按照索引数由小到大进行枚举。
- 使用标签语句可以定义 `continue` 和 `break` 的跳转目的地。

## 5 对象

- 对象最常见的用法是创建、设置、查找、删除、检测和枚举它的属性。
- 属性名可以是包含空字符串在内的任意字符串，但对象中不能存在两个同名的属性（你也无法做到这一点，因为后面的属性会覆盖前面的属性）。
- 关键字 `new` 后跟随一个函数调用，将会创建并初始化一个新对象。
- 每一个 Javascript 对象（`null` 除外）都和另一个对象关联。「另一个」对象就是我们熟知的原型，每一个对象都从原型继承属性。
- 所有通过对象直接量创建的对象都具有同一个原型对象，并可以通过 Javascript 代码 `Object.prototype` 获得对原型对象的引用。通过关键字 `new` 和构造函数调用创建的对象的原型就是构造函数的 `prototype` 属性的值。
- 假设要查询对象 o 的 x 属性，如果 o 中不存在 x，那么将会继续在 o 的原型对象中查询属性 x。如果原型对象中也没有 x，但这个原型对象也有原型，那么继续在这个原型对象的原型上执行查询，直到找到 x 或者查找到一个原型是 `null` 的对象为止。这就是原型链的概念。
- 访问一个不存在的属性并不会报错，而会返回 `undefined`。（注：判断一个属性是否存在应该使用 `in` 运算符）
- `Object` 的 `prototype` 属性是只读的。
- 数据属性的 4 个特征分别是它的值、可写性、可枚举性和可配置性。
- 存取器属性的 4 个特性是读取、写入、可枚举性和可配置性。
- 每个对象都有一个与之关联的原型、类和可扩展性。
- 通过对象直接量穿件的对象使用 `Object.prototype` 作为它们的原型，通过 `new` 创建的对象使用构造函数的 `prototype` 属性作为它们的原型。
- 对象的类属性是一个字符串，用以表示对象的类型信息。类属性不可写，因此除了内置对象有可区分的类属性，自定义对象没有办法通过类属性来区分对象的类。
- 对象序列化是指将对象的状态转换为字符串，也可将字符串还原为对象。

## 6 数组

- Javascript 数组是无类型的：数组元素可以是任意类型，并且同一个数组中的不同元素也可能有不同的类型。
- 数组是对象的特殊形式，其原型 `Array.prototype` 定义了一套丰富的数组操作方法，这些方法在类数组对象中同样有效。
- 数组的特别之处在于其会自动维护 `length` 属性值。

## 7 函数

- Javascript 中函数即对象，你可以给它们设置属性，甚至调用它们的方法。
- 使用函数声明语句定以函数可以在整个作用域内访问，但使用赋值表达式定义函数只能在赋值表达式之后生效（虽然被赋值的变量被提前声明，但初始化工作并未完成）。
- 函数的四种调用方式分别是：作为函数、作为方法、作为构造函数、通过 `call` 或 `apply` 方法间接调用。
- 以函数形式调用的函数上下文通常为全局对象，严格模式下为 `undefined`。
- 作为方法调用的函数会传入一个隐式参数，即调用这个方法的对象，函数中可以使用 `this` 关键字来访问这个对象。
- 嵌套函数中 `this` 不会指向外层函数的上下文。
- 函数对象的 `length` 属性指的是函数声明中参数的个数。
- 调用函数的参数比定义函数的参数少时，多余的参数会被设置为 `undefined`。使用 `a = a || defaultValue` 来对参数设置默认值。
- `arguments` 中的 `callee` 属性指向正在执行的函数，这个属性可以被用来进行匿名函数的递归。
- 当函数需要一个「静态」变量来在调用时保持某个值不便，最方便的方式就是给函数定义属性。
- 函数对象可以通过作用域链相互关联起来，函数体内部的变量都可以保存在函数作用域内，这种特性在计算机科学文献中称为「闭包」。