---
layout: post
title: Java 竟然还能这样玩
category: Java
tags: Java
keywords: Java
description: Code Wars dalao fucked me
---

最近被我父母禁止编程了，而我又不可能无时无刻都在学英语，所以为了劳逸结合，我去 CodeWars 出了个 Java 题，结果被一个大佬 Hack 了 judge
代码，心里酸酸的，赶紧加强了检查，不过我确实是学习到了新的 Java 的姿势，在这里分享一下。

## 题目

[**题目传送门**](https://www.codewars.com/kata/throw-without-throwing/)

大概就是一个傻逼题，先不准你在代码里面写

+ Exception
+ Error
+ Throwable
+ Class

三种子串，然后让你写十几个函数，分别抛出指定的异常。

最后一个 `Class` 是我后期加进去的，因为我突然发现还可以通过拼接字符串（避免直接出现子串，九十年前的操作了） \+ 反射来直接抛出异常，
这就非常不清真。

然后我想了想，这些都禁止了，那用户总得老老实实地执行指定的操作来抛出异常了吧（而不是进行类似 `new IllegalStateException` 这种操作）。

## 第一个解

是拥有 25000\+ honor 的大佬 [Voile](www.codewars.com/api/v1/users/Voile) 给的，每个方法都只有一行，写的我感觉是比较理想的、
我心中所应该存在的解。然后他说，我这个应该是可以 Hack 的。我当时还很不以为然地说，我连 Class 都检查了，也就是说你不能 `getClass`
也不能 `ClassLoader.load` 也不能 `Class.forName` ，应该是很难 Hack 的。。。

然后第二个来解题的人就把我给 Hack 了。。。

## 第二个解

于是半路杀出 Java 大佬，进行了这样的操作：

```java
public static void arrayIndexOutOfBound() {
  throw new ArrayIndexOutOfBoundsExceptio\u006e();
}
```

我当时就一脸懵逼。。。这代码放进 IDEA 就报错了，还能通过编译，还能跑，当时我的测试就被绕过了。。。

然后我就把 `throw` 给 ban 了，我当时以为保留字不能这样操作的。

## 第三个解

然后我把自己奶死了：

```java
public static void arrayIndexOutOfBound() {
  thro\u0077 new ArrayIndexOutOfBoundsExceptio\u006e();
}
```

萌新被欺负得满地打滚。。。 QAQ

## 最后的 validation

最后我把 `\u` 也给 ban 了，他的方法终于不能 Hack 我的 judge 了：

```java
@org.junit.Test
public void notUsingThrow() throws Exception {
  Files.lines(new File("/home/codewarrior/solution.txt").toPath()).forEach(str -> {
    assertFalse(str.contains("Exception"));
    assertFalse(str.contains("Error"));
    assertFalse(str.contains("Throwable"));
    assertFalse(str.contains("Class"));
    assertFalse(str.contains("throw"));
    assertFalse(str.contains("\\u"));
  });
}
```

## 最后

快去试试这道题吧！
