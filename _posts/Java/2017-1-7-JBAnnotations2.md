---
layout: post
title: JetBrains 注解库， Contract 注解
category: Java
tags: Java
keywords: Java,JetBrains,annotations
description: JetBrains annotations library 2
---
## 依赖

同上一篇博客


### 最后的注解 @Contract

```
@org.jetbrains.annotations.Contract
```

我已经在上一篇博客提到了这个神奇的 @Contract 注解。事实上，这个注解能描述的内容更详细，还能在一定程度上代替 @NotNull 和 @Nullable 。

这是一个有值的、用于修饰那些**参数数量大于零并且返回值不为 void 的普通方法和构造方法**的注解，比起 @NotNull 和 @Nullable ，它相对来说更复杂。因此，首先我们得看看它的源码。

```java
package org.jetbrains.annotations;

import java.lang.annotation.*;

@Documented
@Retention(RetentionPolicy.CLASS)
@Target({ElementType.METHOD, ElementType.CONSTRUCTOR})
public @interface Contract {
  String value() default "";

  boolean pure() default false;
}
```

可以看到，这个注解类有两个属性。首先有一个 value 的字符串属性，还有一个 pure 的布尔属性。

首先从容易理解的 pure 说起吧。

#### pure 属性

这个属性听名字都能猜出什么意思——表示被注解的函数（就是方法，包含普通方法、静态方法和构造方法，下同）是否为纯函数。

纯函数（好像）是一个 fp 里面的概念，**如果一个函数，对于特定的输入，都将产生对应的唯一的输出，并且不会影响别的东西（即没有副作用），那么这个函数就是纯函数。**
数学上的函数就是最标准的纯函数，比如我有一个 f(x) ，那么对应每一个 x ，这个函数的输出都有一个对应的 f(x) ，并且我多次输入同一个 x ，输出的 f(x) 也是同一个。
这就是一个纯函数。

举个反例，下面是一段完整的（即可以编译运行的） C 语言代码，这里的函数 not_Pure 就不是一个纯函数。

```c
#include <stdio.h>

int not_Pure(int assWeCan) {
  static int boyNextDoor = 233;
  return ++boyNextDoor * assWeCan;
}

int main(const int argc, const char *argv[]) {
  printf("%d\n", not_Pure(5));
  printf("%d\n", not_Pure(5));
  printf("%d\n", not_Pure(5));
  printf("%d\n", not_Pure(5));
  printf("%d\n", not_Pure(5));
  return 0;
}
```

我在 main 函数里面对 not_Pure 进行了五次调用，每次传进去的参数都是 5 ，但是它却产生了这样的输出：

```c
1170
1175
1180
1185
1190
```

好。话题回到 @Contract 上。那么这个 pure 值怎么使用呢？

当你的函数是一个纯函数时（比如三角函数运算，这是再简单不过的纯函数了），你就可以这样修饰。

```java
  @Contract(pure = true)
  public static native double sin(double a);

  @Contract(pure = true)
  public static native double cos(double a);

  @Contract(pure = true)
  public static native double tan(double a);

  @Contract(pure = true)
  public static native double cot(double a);

  @Contract(pure = true)
  public static native double csc(double a);

  @Contract(pure = true)
  public static native double sec(double a);
```

再比如我算法库大整数的 JNI 端和 Java 端，加减乘除和比大小都不会影响原来的两个算子，会新分配一块内存来放置运算结果，那么这些函数也统统可以使用 @Contract(pure = true)注解。

#### value 属性

这是 @Contract 注解的精髓，应用场景也非常好说明。
首先考虑一个函数——大整数类的 equals 。
我当然是需要处理一些特殊情况的，比如如果你传进去了一个 null ，那么我返回 true 。于是按照 Java 标准库那个注释思路，我们应该这样写：

```java
/**
 * This is a pure function.
 * returns true if the value of given
 * parameter is equaled to the caller.
 *
 * if obj is null, it will return false.
 * if obj is not a org.algo4j.BigInt, it will return false.
 *
 * @param obj the given obj
 * @returns if obj is equaled to the caller
 */
@Override
public boolean equals(@Nullable Object obj) {
  if (obj == null || !(obj instanceof BigInt)) return false;
  if (obj == this) return true;
  return compareTo((BigInt) obj) == 0;
}
```

但是，仔细想想，其实你只是需要告诉用户，要是你给我 null ，我就还你 false 。
使用一大坨自然语言描述这个简单逻辑，不仅会让人看很久，而且如果注释丢了，用户也就无从得知这个情况了，而且这对于英语不好的人非常不友好。

于是我们可以这样写：

```java
@Override
@Contract(value = "null -> false", pure = true)
public boolean equals(@Nullable Object obj) {
  if (obj == null || !(obj instanceof BigInt)) return false;
  if (obj == this) return true;
  return compareTo((BigInt) obj) == 0;
}
```

首先我们省去了一大堆注释，并且使用了一个字符串描述这个逻辑： "null -> false" 。意思就是，给我一个 null ，还你一个 false 。

这个字符串由两部分组成，箭头前面的是参数说明，后面是返回值说明。如果有多种需要说明的情况，那么使用分号隔开。

一共有这么几个允许使用的值：

```java
null // null
!null // not null
true // boolean value true
false // boolean value falses
fail // means this function will not work in this case
_ // any value
```

一共六个，不要忽略了最后一个下划线，它的含义和 Scala 中的下划线相同——表示通配符。比如这个扩展欧几里得函数：

```java
@NotNull
@Contract(value = "_, _ -> !null", pure = true)
public static ExgcdRes exgcd(long a, long b) {
  return new ExgcdRes(exgcdJni(a, b));
}
```

直接两个注解说明一切：首先返回值为非 null ，因此 @NotNull 。
然后，不论你传进来任何值，我都不会返回 null 的，因此 @Contract("_, _ -> !null") 。
最后，它是一个纯函数，因此 pure = true 。综上，有了这个函数的注解：

```java
@NotNull
@Contract(value = "_, _ -> !null", pure = true)
```

我那几个大整数加减乘除的方法就可以这样写了：

本地接口：

```java
@NotNull
@Contract(value = "!null, !null -> !null", pure = true)
private static native byte[] plus(@NotNull byte[] a, @NotNull byte[] b);

@NotNull
@Contract(value = "!null, !null -> !null", pure = true)
private static native byte[] times(@NotNull byte[] a, @NotNull byte[] b);

@NotNull
@Contract(value = "!null -> !null", pure = true)
private static native byte[] times10(@NotNull byte[] a);

@NotNull
@Contract(value = "!null, !null -> !null", pure = true)
private static native byte[] divide(@NotNull byte[] a, @NotNull byte[] b);

@NotNull
@Contract(value = "!null, !null -> !null", pure = true)
private static native byte[] minus(@NotNull byte[] a, @NotNull byte[] b);

@NotNull
@Contract(value = "!null, _ -> !null", pure = true)
private static native byte[] pow(@NotNull byte[] a, int pow);

@Contract(pure = true)
private static native int compareTo(@NotNull byte[] a, @NotNull byte[] b);
```

调用：

```java
@NotNull
@Contract(value = "_ -> !null", pure = true)
public BigInt plus(@NotNull BigInt anotherBigInt) {
  if (sig == anotherBigInt.sig)
    return new BigInt(plus(data, anotherBigInt.data), sig);
  if (compareTo(data, anotherBigInt.data) > 0)
    return new BigInt(minus(data, anotherBigInt.data), sig);
  return new BigInt(minus(anotherBigInt.data, data), !sig);
}

@NotNull
@Contract(value = "_ -> !null", pure = true)
public BigInt minus(@NotNull BigInt anotherBigInt) {
  if (sig != anotherBigInt.sig)
    return new BigInt(plus(data, anotherBigInt.data), sig);
  if (compareTo(data, anotherBigInt.data) > 0)
    return new BigInt(minus(data, anotherBigInt.data), sig);
  return new BigInt(minus(anotherBigInt.data, data), !sig);
}

@NotNull
@Contract(value = "_ -> !null", pure = true)
public BigInt times(@NotNull BigInt anotherBigInt) {
  return new BigInt(times(data, anotherBigInt.data), sig == anotherBigInt.sig);
}
```

是不是很简单呢？其实有时 JetBrains IDE 还会给出建议，让你为你的方法加上这些注解哦。注解库也不大，就几十 kb 。

祝你愉快。注解的实际使用还可以参照我的算法库，这是一个活生生的例子 DAZE ，请点击[GitHub 传送门](https://github.com/ice1000/algo4j)。喜欢的话给个 star 哟。
