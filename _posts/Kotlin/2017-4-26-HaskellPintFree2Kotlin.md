---
layout: post
title: Kotlin ：强行 Point-Free
category: Kotlin
tags: Kotlin
keywords: Kotlin
description: Kotlin can be point-free, too
---

昨天在学习 Haskell 的过程中了解了什么是 Point-Free 风格，然后瞬间中毒。于是我就打算在 Kotlin 里面模拟一下。

这是 Haskell 中不 Point-Free 的版本：

```haskell
generate :: (Num a, Enum a) => [a] -> [a]
-- not point free
generate ls = zipWith (*) [0..] ls
```

引用大魔头在[他的 Haskell 教程](https://zhuanlan.zhihu.com/p/21624824)里面说过的一句话，

> 两边约掉个参数

于是我们可以写出 Point-Free 的版本：

```haskell
generate :: (Num a, Enum a) => [a] -> [a]
-- point free
generate = zipWith (*) [0..]
```

然后我就尝试把它翻译为 Kotlin。

## 解释

首先向各位看不懂 Haskell 的看官解释一下什么是 Point-Free。

### 柯里化

先假设 Kotlin 自带柯里化，也就是说，我定义函数

```kotlin
fun a(a: Int,b: Int) = a + b
```

之后，我可以这样调用

```kotlin
val x = a(1)
val y = x(2)
print(y) // 3
```

### Point-Free

然后我可以这样：

```kotlin
fun plus1(x: Int) = a(1)(x)
```

对吧，就是一个返回参数`+ 1`的函数。

这是不 Point-Free 的写法。

```kotlin
fun plus1() = a(1)
```

这是 Point-Free 的写法。很简单吧。

## Kotlin 强行模仿

因为标准库没有`zipWith`这个函数，所以我们先写一个，然后手动柯里化了：

```kotlin
fun <A, B, C : Any> zipWith(op: (A, B) -> C) = { x: Sequence<A> ->
  { y: Sequence<B> ->
    val iX = x.iterator()
    val iY = y.iterator()
    generateSequence {
      if (iX.hasNext() and iY.hasNext()) op(iX.next(), iY.next())
      else null
    }
  }
}
```

此处使用了惰性序列`Sequence`来模拟 Haskell 的惰性求值，然后使用返回带参数的 Lambda 的方式模拟柯里化。

然后写个那个破函数：

```kotlin
fun generate() = zipWith { x: Int, y: Int -> x * y } (
    generateSequence(0, Int::inc)
)
```

对比 Haskell 的两行：

```haskell
generate :: (Num a, Enum a) => [a] -> [a]
generate = zipWith (*) [0..]
```

很简单吧？调用就是这样：

```kotlin
fun main(args: Array<String>) {
  generate()(sequenceOf(1, 1, 2, 3, 5, 8, 13, 21))
      // .forEach(::println)
}
```

把那行注释取消了就是输出。

对比 Haskell 的调用：

```haskell
generate [1, 1, 2, 3, 5, 8, 13, 21]
```

**Easy\~**

## 完整的代码

我把完整的代码贴到了[我的 gist](https://gist.github.com/ice1000/015d44294fd1c5fd33cdbf7e65d2c7ed)上。

试下调用 gist 的 API （很可能需要翻墙才能看到）：

<script src="https://gist.github.com/ice1000/015d44294fd1c5fd33cdbf7e65d2c7ed.js"></script>
