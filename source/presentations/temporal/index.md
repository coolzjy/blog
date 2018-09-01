# Temporal

---

Temporal 是一个用来处理日期和时间的 ECMAScript 提案。它解决了 `Date` API 在使用过程中长期存在的一些痛点。

--

## `Date` API 的问题

- <!-- .element: class="fragment" --> 不支持除用户本地时区及 UTC 以外的时区
- <!-- .element: class="fragment" --> 不可靠的解析器
- &shy;<!-- .element: class="fragment" --> `Date` 对象是可变的
- <!-- .element: class="fragment" --> 不支持非公历历法
- <!-- .element: class="fragment" --> 计算 API 缺失

Notes:
`Date` 作为 JavaScript 最常用的基础 API 之一，提供了处理日期和时间的能力。像 JavaScript 中其他糟糕的部分一样，这个 API 在 10 天的开发期限内被草草的设计出来，确切的说是从 `java.Util.Date` 借鉴过来。然而这个实现很糟糕，Java 在两年后的版本中就废弃了这个实现。然而时至今日我们仍然不得不在 JavaScript 使用这个 API。

--

Temporal 通过以下方式解 Date API 的问题：

- <!-- .element: class="fragment" --> 对所有时区的出色支持，包括对夏令时的计算
- <!-- .element: class="fragment" --> 解析一个严格规定的字符串格式(ISO-8601)
- <!-- .element: class="fragment" --> 不提供修改 API，即 Temporal 对象是不可变的
- <!-- .element: class="fragment" --> 支持非公历历法，包括农历等
- <!-- .element: class="fragment" --> 提供了易于使用的日期、时间计算接口

--

![Compatible](https://caniuse.bitsofco.de/image/temporal.png)

--

[Polyfill](https://www.npmjs.com/package/temporal-polyfill)

[Try Online](https://tc39.es/proposal-temporal/docs/index.html)

---

## 开始之前

让我们先聊一下日期和时间<!-- .element: class="fragment" -->

--

### 2024 年 4 月 12 日 17 点 10 分 10 秒

公历（阳历 / 西历 / 格里历）<!-- .element: class="fragment" -->

北京时间（Asia/Shanghai）<!-- .element: class="fragment" -->

--

- &shy;<!-- .element: class="fragment" --> *精确时刻* ：代表一个固定的时间点，不考虑历法和时区。
- &shy;<!-- .element: class="fragment" --> *当地时间* ：历法和时区完备的时间表示。

&shy;<!-- .element: class="fragment" --> *当地时间* = *精确时刻* + *历法表示* + *时区偏移（包括夏令时调整）*。

---

## `Temporal` 核心 API

- &shy;<!-- .element: class="fragment" --> 精确时刻：`Temporal.Instant`
- &shy;<!-- .element: class="fragment" --> 当地时间：`Temporal.ZonedDateTime`

---

## `Temporal.Instant`

`Temporal.Instant` 代表一个固定的时间点（精确时刻），不考虑历法和地点。是最基础的 `Temporal` 类型。

--

## 创建一个 `Instant` 对象

- &shy;<!-- .element: class="fragment" --> `Temporal.Instant.fromEpochSeconds()`
- &shy;<!-- .element: class="fragment" --> `Temporal.Instant.fromEpochMilliseconds()`

--

`Temporal.Instant` 可以与 `Date` 方便的进行互操作。

```js
// Date 转 Instant
const date = new Date();
const instant = Temporal.Instant.fromEpochMilliseconds(date.getTime());

// Instant 转 Date
const instant = new Temporal.Instant(0n); // Unix 纳秒时间戳，bigint 格式
const date = new Date(instant.epochMilliseconds);
```

---

## `Temporal.ZonedDateTime`

`Temporal.ZonedDateTime` 是一个时区完备、历法完备的日期/时间对象。是最全面的 `Temporal` 类型。

--

<!-- .slide: data-auto-animate -->
### 创建一个 `ZonedDateTime` 对象
通过为 `Instant` 对象指定历法和时区

```js
const instant = Temporal.Instant.fromEpochSeconds(1711900800);

instant.toZonedDateTime({
  calendar: "iso8601",
  timeZone: "Asia/Shanghai",
});
// or
instant.toZonedDateTimeISO("Asia/Shanghai");
```

--

<!-- .slide: data-auto-animate -->
### 创建一个 `ZonedDateTime` 对象
通过描述对象

```js
const zonedDateTime = Temporal.ZonedDateTime.from({
  year: 2024,
  month: 1,
  day: 1,
  timeZone: "Asia/Shanghai",
  calendar: "chinese",
});
```

--

<!-- .slide: data-auto-animate -->
### 创建一个 `ZonedDateTime` 对象
通过 ISO-8601 字符串

```js
const zonedDateTime = Temporal.ZonedDateTime.from(
  "2024-01-01[Asia/Shanghai][u-ca=chinese]"
);
```

<footer style="font-size: 0.6em;">注意：通过 ISO-8601 字符串创建 <code>ZonedDateTime</code> 时，时间/日期值会按照 ISO 8601 标准解析。<footer>

--

## 获取不同历法的时表示
[支持的历法列表](https://github.com/unicode-org/cldr/blob/latest/common/bcp47/calendar.xml)

```js
const zdt = Temporal.ZonedDateTime.from("2024-04-01[Asia/Shanghai]");
const chineseZdt = zdt.withCalendar("chinese");
```

--

## 获取不同时区的时间

```js
const Shanghai = Temporal.ZonedDateTime.from("2024-04-01T10[Asia/Shanghai]");

const Tokyo = Shanghai.withTimeZone("Asia/Tokyo");
const NewYork = Shanghai.withTimeZone("America/New_York");
```

---

## `Temporal` 计算 API

- &shy;<!-- .element: class="fragment" -->时段表示：`Temporal.Duration`
- &shy;<!-- .element: class="fragment" -->计算方法：
  - `Temporal.*.prototype.add()`
  - `Temporal.*.prototype.subtract()`
  - `Temporal.*.prototype.since()`
  - `Temporal.*.prototype.until()`

--

### `Temporal.Duration`

`Temporal.Duration` 表达了一个时间长度，如 5 分钟 30 秒。它被用于日期/时间运算和测量 `Temporal` 对象之间的差异。

--

### 创建一个 `Duration` 对象
通过描述对象
```js
const duration = Temporal.Duration.from({
  months: 1,
})
```

通过 [ISO-8601 时间段表示法](https://zh.wikipedia.org/wiki/ISO_8601#%E6%97%B6%E9%97%B4%E6%AE%B5%E8%A1%A8%E7%A4%BA%E6%B3%95)。
```js
const duration = Temporal.Duration.from('P1M');
```

--

### 使用 `Duration` 进行 `Temporal` 对象运算

```js
const zdt = Temporal.ZonedDateTime.from("2024-04-01[Asia/Shanghai]");
zdt.add('P1M'); // 自动转化为 Temporal.Duration
```

```js
Temporal.ZonedDateTime.from("2024-04-01[Asia/Shanghai]")
  .since('1949-10-01[Asia/Shanghai]', { largestUnit: 'years' })
```
---

## 其他 `Temporal` API

- &shy;<!-- .element: class="fragment" --> 只包含日历信息的相对时间类型：
  - &shy;<!-- .element: class="fragment" --> PlainDateTime
  - &shy;<!-- .element: class="fragment" --> PlainDate
  - &shy;<!-- .element: class="fragment" --> PlainTime
- &shy;<!-- .element: class="fragment" --> 历法 API：`Temporal.Calendar`
- &shy;<!-- .element: class="fragment" --> 时区 API：`Temporal.TimeZone`

---

## Format?

---

## Further Reading

+ [Temporal Proposal](https://tc39.es/proposal-temporal/docs/zh_CN/index.html)
+ [公历](https://zh.wikipedia.org/wiki/%E5%85%AC%E5%8E%86)
+ [农历算法](https://ytliu0.github.io/ChineseCalendar/rules_simp.html)
+ [UTC / 协调世界时](https://zh.wikipedia.org/wiki/%E5%8D%8F%E8%B0%83%E4%B8%96%E7%95%8C%E6%97%B6)
+ [夏令时](https://zh.wikipedia.org/wiki/%E5%A4%8F%E6%97%B6%E5%88%B6)