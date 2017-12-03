---
layout: post
title: 正确地使用 Kotlin 的 internal
category: Kotlin
tags: Kotlin
keywords: Kotlin
description: Kotlin internal
---

Kotlin 的 internal 被定义为 "只有这个模块可以调用" 却在被打包为 jar 后可以被 Java 代码视为 `public` 调用， which 被广为诟病。
那么就让我们来看看怎么解决这个问题吧。

这个问题其实很好解决，不知道为什么之前都没有人发现。
方法就是欺负 Java 语法不行。

比如说我们有这个 Kotlin 的 `internal` 函数。

```kotlin
internal fun zython() {
}
```

如果 Kotlin 编译器能知道有 Java 代码跨模块调用了它，那么 Kotlin 编译器会说编译不过。
但是如果把这个函数的定义打包进一个 jar 然后完全脱离 Kotlin 编译器的怀抱，那么就鸡寄了， Java 就可以为所欲为。

那么我们应该怎么惩戒那些为所欲为的垃圾 Java 厨呢。

## 方法一

我们可以使用 `@JvmName` 这个神器。

这个注解可以让 Kotlin 编译器改变生成的函数在字节码里面的名字，但是在代码里面依然可以使用原本的名字。
那么，我们使用 `@JvmName` ，给它一个 Java 写不出来的函数名就好了。

比如，在函数名里面加一个空格。

```kotlin
@JvmName(" zython")
internal fun zython() {
}
```

或者你是 Haskell 厨，那么你可以骚一点

```kotlin
@JvmName("{-# LANGUAGE Zython #-}")
internal fun zython() {
}
```

这样的话，调用这个函数的权利就被 Kotlin 独占了，因为如果在 jar 里面引用的话，函数名就是 `@JvmName` 的参数，
which Java 根本写不出来，只有 Kotlin 可以用。

然后我们的 `internal` 修饰符就达到了效果。

## 方法二

我们可以劲爆一点，直接就在 Kotlin 里面使用骚命名。

我们知道， Kotlin 允许使用 \` \` 把一个不合法的标识符强行合法化，当然本身是合法的也能用。
一般我们都只用于关键字冲突的情形，可你们一定没想到有这种妙用吧。

我们依然可以普普通通地使用加空格之类的欺负 Java 的方法：

```kotlin
internal fun ` zython`() {
}
```

或者你是 Haskell 厨，那么你可以骚一点

```kotlin
internal fun `{-# LANGUAGE Zython #-}`() {
}
```

这都是支持的。
比如我在[我的一个个人项目里的某个文件](https://github.com/icela/FriceEngine/blob/master/src/org/frice/Initializer.kt)就用了这种操作。
当然我不是为了 `internal` ，只是为了好看。

## 结束

顺带一提，刚刚在复制这篇文章的内容的时候，谷歌翻译把我的代码给翻译出来了， `internal fun` 变成了 "内部的乐趣"，笑出声。

我说完了。
