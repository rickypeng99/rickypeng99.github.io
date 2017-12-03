---
layout: post
title: Kotlin ： forEach 也能 break 和 continue
category: Kotlin
tags: Kotlin
keywords: Kotlin
description: Kotlin forEach has breaking and continuing, too
---

昨天在 BennyHuo 的 Kotlin 裙里看到有人在讨论关于

> 如何在 forEach 中跳出循环

这样的问题。也就是说，他们想用 forEach 而不是 for 循环，因为这很 fp ，很洋气（我也喜欢），
但是他们又想使用 break 和 continue ，也就是普通的流程控制语句中的控制语句。

这很不 fp ，因为原本有 filter 是用于完成这个工作的，还有 flapMap。BennyHuo 在他发的文章里面也说的是这种方法。

filter 很 fp ，但是会导致两次遍历，这样的话给人一股效率很低的赶脚。而 Java8 的 Stream API 就只会遍历一次，
而且很 fp。但是它会有 lambda 对象的产生而且实现超复杂（我没看过，不清楚），而 Kotlin 的集合框架可是能 inline 掉 lambda 的，
少产生了多少对象啊，怎么能和辣鸡 Java 同流合污呢？

有人提到使用 label return ，比如：

```kotlin
fun main(ags: Array<String>) {
  (0..100).forEach {
    if (50 <= it) return@forEach
    println(it)
  }
}
```

但是他做了实验之后发现这玩意只能相当于 continue ，也就是说你只能跳出当前循环，然后还是会继续下一轮。

讲道理这个你仔细想想就可以发现。为了搞清楚其中的道理，我们自己实现一个 forEach。

```kotlin
fun Pair<Int, Int>.forEach(block: (Int) -> Unit) {
  for (i in first..second) block.invoke(i)
}
```

然后调用一下：

```kotlin
Pair(1, 100).forEach(::println)
```

没毛病老铁。

然后你会发现，你在函数体内对 block 产生了(second - first + 1)次调用，不论你怎么 return ，都只会跳出这个 block ，
它并不影响你之后继续调用这个 block ，也就是说这个 for 循环不受 block 行为的影响。

看起来无解了，那怎么办呢？

那么就让我来拯救你们吧。

```kotlin
fun main(ags: Array<String>) {
  run outside@ {
    (0..20).forEach inside@ {
      if (10 <= it) return@outside
      println(it)
    }
  }
}
```

编译之后运行结果：

```
0
1
2
3
4
5
6
7
8
9

Process finished with exit code 0
```

呐，跳出去了。

把 label 的名字起的清真一点，就是这样：

```kotlin
run breaking@ {
  (0..20).forEach continuing@ {
    if (10 <= it) return@breaking
    println(it)
  }
}
```

上面这是 break ，运行结果就上面那样。

下面这是 continue ，运行结果就是 continue 的效果。为了让效果表现的明显，我把 println 复制了一下，
分别在 if 前后，这样可以很清楚地看到效果。

```kotlin
run breaking@ {
  (0..20).forEach continuing@ {
    print(it)
    if (10 <= it) return@continuing
    println(it)
  }
}
```

运行一下：

```
00
11
22
33
44
55
66
77
88
99
1011121314151617181920
Process finished with exit code 0
```

而且只进行了一次迭代，非常清真，效率看起来也比较高。

如何证明只有一次迭代？我使用 jd-gui 逆向了刚才的代码，结果：

```java
public final class _5Kt
{
  public static final void main(@NotNull String[] args)
  {
    Intrinsics.checkParameterIsNotNull(args, "args");
    int $i$a$1$run;
    Iterable $receiver$iv = (Iterable)new IntRange(0, 20);
    int $i$f$forEach;
    for (Iterator localIterator = $receiver$iv.iterator(); localIterator.hasNext();)
    {
      int element$iv = ((IntIterator)localIterator).nextInt();int it = element$iv;
      int $i$a$1$forEach;
      System.out.print(it);
      if (10 <= it) {
        break;
      }
      System.out.println(it);
    }
  }
}
```

确实只有一次，而且 jd-gui 直接把我的行为反编译为 break 了。服不服？

**无 fuck 说**

