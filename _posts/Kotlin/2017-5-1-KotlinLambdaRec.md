---
layout: post
title: Kotlin ： Lambda 也能递归
category: Kotlin
tags: Kotlin
keywords: Kotlin
description: Kotlin Lambda expression can recurse, too
---

> 这些问题产生的原因，都是你懂的太少，而不是 Kotlin 太弱。

## 无中生有的事情

刚才在某个 Kotlin 裙里看到有人在讨论关于

> kotlin 竟然不支持 lambda 递归调用

这种无中生有的事，你把它拿来说一遍，等于，你也有责任吧。

Kotlin 怎么可能不支持 Lambda 递归呢？接下来我要用两种方式实现这破玩意，你们看好了。

举的例子就是 `n^2` 展开的斐波那契。

## 方法一

我们通过函数内部函数实现。

```kotlin
fun main(args: Array<String>) {
  fun lambda(it: Int): Int =
      if (it <= 2) 1 else lambda(it - 1) + lambda(it - 2)
  (1..10)
      .map(::lambda)
      .forEach(::println)
```

编译运行看输出：

```
1
1
2
3
5
8
13
21
34
55
```

是不是没有什么问题，是不是万万没想到，怎么可能，这种应该随便就可以想到才对，
想不到的都该劝退了。

## 方法二

我们也可以直接使用 Lambda 。这样的代码会报错：

```kotlin
val lambda3 = { if (it <= 2) 1 else lambda3(it - 1) + lambda3(it - 2) }
```

我们自然是不能直接写这样的代码的，它会说 lambda3 没有定义。那么我们为什么不能这样呢：

```kotlin
val lambda3: (Int) -> Int =
    { if (it <= 2) 1 else lambda3(it - 1) + lambda3(it - 2) }
```

还是不行，虽然少了一个错误，但是 lambda3 还是一个没定义的东西。那么我们分开：

```kotlin
val lambda3: (Int) -> Int
lambda3 = { if (it <= 2) 1 else lambda3(it - 1) + lambda3(it - 2) }
```

这下 lambda3 终于不是未定义变量了，但是 lambda3 没有初始化，还是要报错，所以说我们需要随便给它一个初值：

```kotlin
var lambda2: (Int) -> Int = { it }
lambda2 = { if (it <= 2) 1 else lambda(it - 1) + lambda(it - 2) }
```

现在就不会报错了，那个初值随便给，我举几个不同写法的例子：

```kotlin
var lambda2: (Int) -> Int = { it }
var lambda3: (Int) -> Int = Int::inc
var lambda4: (Int) -> Int = { 1 }
var lambda5: (Int) -> Int = { throw RuntimeException() }
```

这些都是合法的，可以通过编译的，可以运行的初始化代码。

最终完整版：

```kotlin
  var lambda2: (Int) -> Int = { it }
  lambda2 = { if (it <= 2) 1 else lambda(it - 1) + lambda(it - 2) }
  (1..10)
      .map(lambda2)
      .forEach(::println)
```

运行结果：

```kotlin
1
1
2
3
5
8
13
21
34
55
```

## 结论

不要再乱说话了，将来报道上出了偏差，你们要负责任。

## Gist

估计要翻墙才能看到：

<script src="https://gist.github.com/ice1000/c024efa6d46ef63111c95dee139a83e7.js"></script>

**无 fuck 说**

