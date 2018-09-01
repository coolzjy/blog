---
title: 关于触发器
date: 2015-04-09 23:30:00
---

## 触发器的嵌套与递归

**触发器嵌套** 指的是一个触发器的操作启动了其他触发器。DBMS 允许触发器嵌套，但对嵌套的层数做出了限制。以 MS SQL Server 为例，其限制触发器最大的嵌套层数为 32 层，即最多连续触发 32 个触发器。当触发器的嵌套数量超过 32 时，最后一个触发器将会启动失败，而整个嵌套操作连同启动第一个触发器的操作将会被回滚。

**触发器递归** 指的是一个触发器的操作启动了自身，或启动了其他触发器而后又启动了自身形成闭环。称前者为 _直接递归_，后者为 _间接递归_。DBMS 会对触发器直接递归做出限制：如 MS SQL Server 中直接递归的触发器只会被执行一次；而 MySQL 中则直接限制在触发器中对当前表进行操作，防止形成直接递归。而间接递归触发器则会被 DBMS 当作触发器嵌套处理，如果没有做特殊处理，按照嵌套数量最大时的处理规则，间接递归触发器及启动第一个触发器的操作都不会生效。

<!--more-->

## 例子

结构及数据：

```auto
  Table1          Table2
+---------+     +---------+
|   Col   |     |   Col   |
+---------+     +---------+
|    0    |     |    0    |
+---------+     +---------+
```

触发器：

```sql
Trigger1: ON Table1 AFTER UPDATE
          UPDATE Table2 SET Col = Col + 1
Trigger2: ON Table2 AFTER UPDATE
          UPDATE Table1 SET Col = Col + 1
```

SQL 语句：

```sql
UPDATE Table1 SET Col = Col + 1
```

结果：

```auto
[SQL Server]Maximum stored procedure, function, trigger, or view nesting level exceeded (limit 32).
```

Table1 Table2 中的数据未发生变化

## 触发器使用的注意事项

- **每个数据库操作只能启动一次触发器**
- **只在必要的时候使用触发器**
