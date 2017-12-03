---
layout: post
title: Kotlin 的一些好东西概览（不含 extension
category: Kotlin
tags: Essay
keywords: Kotlin
description: Nice Kotlin!
---


## 又是一篇因为后宫群的聊天而 po 上来的博客

今天在聊天的时候向依依同学展示了几个 Kotlin 的例子，顺便帖在这里供大家参考了 = =

### 关于 null safety ：

我在后宫群里是这么解释的 = =

> 通过静态分析处理所有 null 。原理类似 Option\[\_\]，但是这个开销比 `Option` 小，性能也好，还能和 Java 兼容到一块去。
> 只不过 Java 那边只能兼容到 warning 的层次， JetBrains 做不到魔改编译器。<br/>
> Kotlin 里面所有的类型都有 `Nullable` 和 `NotNull` 之分，辣鸡 Scala 没有 = = <br/>
> 所有的 `NotNull` 从一开始就不能做任何可能让它成为 `null` 的操作，而 `Nullable` 必须在进行只有非 `null` 对象才可以进行的每次操作时（比如在这个对象上调用方法，就不能是 `null` ）进行强制的 `null` 检查。<br/>
> 为了便利性， Kotlin 提供了一些语法糖来简化写法。

```kotlin
// 比如
if (a != null) a.invoke()
// 就可以是
a?.invoke()
```

> 这类语法糖很多语言都有（比如 `C#` ），但是只有 Kotlin 有强制的检查。
> 它让你写出完全不可能产生 NPE 的代码（或者一旦出现 `null` 立即 GG 的代码，这样你可以直接在 GG 的地方找到 `null` 的来源）

我之前以为 `Option[_]` 是这样的：

> 我觉得 `Option` 相当于把锅扔给类型系统了，照样有静态检查（前提是你在代码中处处使用 `Option` ）

3A 是这么说 Scala 的 `Option[_]` 的：

> `Option` 只是提供一种给任意类型表示逻辑空的方法。实际关于 `null` 的问题是在很多场合下比如排除 `null` （逻辑空）的情况。就算包一层 `Option` 也一样没排除这种情况。 `Option` 解决的和空安全我认为是俩问题
> 完了那句话我说的是我认为没分析，不是说 `optional`


```kotlin
var b: Object = getNotNullObj()
var a: Object? = getObj()
b = a // error
if (a != null)
  b = a // OK!
```

### 还有一个 Scala 没有的功能，叫 Smart cast

说明写进注释了。自己看：

```kotlin
val a: Object = getFucker() // metion: a is java.lang.Object
if (a is Fucker) a.fuck() // here a is treated as a specific class: Fucker
```

```scala
val a: Object = getFucker() // metion: a is java.lang.Object
if (a is Fucker) (a as Fucker).fuck() // Scala
```

```java
// Java 还得这么写：
Object a = getFucker();
if (a instanceof Fucker) ((Fucker) a).fuck();
```

当你在使用 nullable 类型的时候，也可以使用 smart cast ：

```kotlin
val a = getSomeNullable()
a?.call() // OK
a!!.call() // OK
// a.call() // Error
if (a != null) a.call() // OK
```

如果是 mutable 类型(就是 `var` 声明的)，需要先赋值给一个 immutable 类型的变量(就是 `val`)才能用这个 smart cast ，因为有可能 `var` 在别的线程被改变。

如果 `val` 是重载了 getter 的，那也不能 smart cast 。

这是为了弥补 Kotlin 没有模式匹配的另一个曲线救国的措施。

关于 `when` 语句：

```kotlin
when(a) {
  someValue -> fuck()
  is Fucker -> a.fuck() // 这里也可以 smart cast
  in someCollection -> someCollection.remove(a)
}
```

smart cast 同样可用，还能对重载了 `contains` 操作符的类型进行 `in` 的判断。

对于 Enum 或者常量的 when 语句就是一个 `switch` 。
而出现了 Java 所不允许的情况时，它将变成 `if else`.

如果你还想继续深入了解这些 JVM Languages 之间的区别，可以看看 [Kotlin-discussion 的这个帖子](https://discuss.kotlinlang.org/t/will-be-kotlin-more-suitable-for-develop-than-scala-in-future/2222)。

