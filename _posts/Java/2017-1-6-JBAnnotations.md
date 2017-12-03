---
layout: post
title: 使用 JetBrains 注解库注释你的代码
category: Java
tags: Java
keywords: Java,JetBrains,annotations
description: JetBrains annotations library
---

## 依赖

+ annotations-java8.jar

这个包在任何一个 JetBrains IDE 的安装目录里面都有，在 kotlin-runtime.jar 里面也有，在 maven 仓库也有。

## 为什么需要它

首先我们知道 Kotlin 解决了一个万年大问题—— null 。
几乎每个代码量超过两千的项目，先做出原型后，前两次运行或单元测试，都死在 NullPointerException 上。
Kotlin 从根本上解决了这个问题——它要求你在编译期处理所有可能为 null 的情况，这是语言级别的支持，比 C#那种只提供一个语法糖的半吊子好得多。

但是反观 Java ，就没这玩意。
因此，伟大的 JetBrains 就搞了个注解库，然后通过在 IDE 里面提示你处理那些可能为 null 的值（毕竟你没法直接让编译器自己检查并提示）来解决这个问题
（其实人家自己早就在用了，只是 Kotlin 也用到了这个注解库而已）。

本次讲五个注解。我写的全限定名，因为把包名也写出来可以方便读者区分它和另外一套同名注解（ sun 的垃圾玩意）。还有一个很重要的注解 @Contract ，下一篇博客再讲。

### 第一个注解， @TestOnly

```java
@org.jetbrains.annotations.TestOnly
```

这个说都不用说了，就是专门写给单元测试服务的相关代码的注解。比如我的算法库，在单元测试端我写了对应的暴力算法来验证我的算法的正确性（这种方法在 OI 中称为**对拍**），那么这几个暴力算法的实现就适合使用 @TestOnly 注解修饰。

```kotlin
/**
 * brute force implementation of binary indexed tree.
 */
private inner class BruteForce
@TestOnly
internal constructor(length: Int) {
  @TestOnly
  private val data = LongArray(length)

  @TestOnly
  fun update(from: Int, to: Int, value: Long) {
    (from..to).forEach { data[it] += value }
  }

  @TestOnly
  fun query(from: Int, to: Int): Long {
    var ret = 0L
    (from..to).forEach { ret += data[it] }
    return ret
  }

  @TestOnly
  operator fun get(left: Int, right: Int) = query(left, right)
}
```

### 第二、三个注解， @NotNull 和 @Nullable

```java
@org.jetbrains.annotations.NotNull
@org.jetbrains.annotations.Nullable
```

这个很简单，顾名思义。它们一般被用来注解带有返回值的方法、方法参数、类的成员变量。

当 @NotNull 注解一个方法参数的时候， IDE 会在调用处提示你处理 null 的情况（当然，如果 IDE 语义上认为你传进去的参数不可能是 Null ，那么当然没有提示了）；
当它注解一个有返回值的方法的时候，它会检查返回值是否可能是 null 。如果可能，那也会有提示。

当 @Nullable 注解一个方法参数的时候， IDE 会在方法内部提示你处理该参数为 null 的情况；
当它注解一个有返回值的方法的时候，会在调用处提示你处理方法返回值为 null 的情况。

**相应的，任何以 @NotNull 修饰的变量/属性/方法，它在 Kotlin 中对应的类型都写作它本身，即非 null 类型，任何以 @Nullable 修饰的变量/属性/方法，它在 Kotlin 中对应的类型都写作它本身后面跟一个问号，即可能为 null 的类型。**
这和 Java 的区别在于， Kotlin 编译器强制你处理 null ， Java 只有 IDE 警告。
另外，这个注解本身的命名也是一种警告，不过是对于开发者而言的。

### 第四、五个注解， @Nls 和 @NonNls

```java
@org.jetbrains.annotations.Nls
@org.jetbrains.annotations.NonNls
```

这是两个十分有意思的注解，用于修饰字符串，而且是写给**人**看的，这个就不是给 IDE 看的辣。
@Nls 用于修饰**自然语言字符串**，比如下面这个例子。
假设 textArea 是一个 JTextArea ，是一个游戏画面用于显示一些提示信息的框框。
这些提示信息当然是自然语言了。

所以就可以这样修饰：

```java
public void boyNextDoor(@Nls String msg) {
  textArea.append(msg);
}
```

或者用于程序的 Crash 信息：

```java
public DividedByZeroException(@NotNull @Nls String msg) {
  super(msg);
}
```

然后阅读代码的人就知道，哦，这个 msg 里面是一些自然语言，比如什么"My name is Van, I'm an artist."之类的。

反之， @NonNls 就是用于修饰非自然语言。
比如我的算法库有一个大整数类，其中有一个构造方法接收一个字符串，然后这个大整数就从字符串构造。
这个字符串一般长这样： "23333333333333333333333333" 或者： "-6666666666666666666666666666666"。

这显然不是自然语言！于是：

```java
public BigInt(@NotNull @NonNls String origin) {
  boolean sigTemp;
  if (origin.startsWith("-")) {
    sigTemp = false;
    origin = origin.substring(1);
  } else sigTemp = true;
  byte[] ori = origin.getBytes();
  if (ori.length == 1 && ori[0] == '0') sigTemp = true;
  data = ori;
  sig = sigTemp;
}
```

祝你愉快。注解的详细使用还可以参照我的算法库，这是一个活生生的例子 DAZE ，请点击 [GitHub 传送门](https://github.com/ice1000/algo4j)。喜欢的话给个 star 哟。
