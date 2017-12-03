---
layout: post
title: Fuck Hadoop 日了狗了
category: Tools
tags: Java
keywords: Java,Hadoop
description: Fuck Apache Hadoop
---

## 本篇博客发表当天晚上的更新

我加入了本地依赖之后，它给我说找不到类，于是我去 Apache 中央仓库找对应的类（似乎不能单独加进 Gradle 依赖），然后使用辣鸡迅雷下了四五个 zip ，然后又解压找到 jar ，加进依赖，每加一个进去就又报不同的另一个找不到类，心都碎了，后来试图直接使用 Maven 中央仓库的这个依赖：

```c
17/02/02 23:17:58 WARN mapred.JobClient: Use GenericOptionsParser for parsing the arguments. Applications should implement Tool for the same.
17/02/02 23:17:58 WARN mapred.JobClient: No job jar file set.  User classes may not be found. See JobConf(Class) or JobConf#setJar(String).
17/02/02 23:17:58 INFO mapred.JobClient: Cleaning up the staging area file:/tmp/hadoop-asus1/mapred/staging/asus1-1791722066/.staging/job_local_0001
Exception in thread "main" java.lang.RuntimeException: java.lang.InstantiationException
```

我选择死亡，这玩意果然还是不适合 Windows 。我还是转 Scala 用 Spark 吧。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/img/UninstallHadoop.jpg)


## 以下是原文

最近恰巧看到 JavaCodeGeeks 上面在发 Hadoop 教程，于是就去玩了一把，结果兴致冲冲地拿 Kotlin 写了一个程序试试，结果报了一个鬼迷日眼的错。

```c
Exception in thread "main" Java.io.IOException: Failed to set permissions of path: \tmp\Hadoop-[User]\mapred\staging\[User]-4954228\.staging to 0700
```

我花了很长时间 Google 和 StackOverflow ，发现许多前辈已经遇到这个问题了，并且我没有找到很快就可以操作结束的解决方案。

据说 Linux 上没问题，但是 Windows 下会报错。官方的 issue 也摆着，但是人家就是不管：

[https://issues.apache.org/jira/browse/HADOOP-7682](https://issues.apache.org/jira/browse/HADOOP-7682)

讲道理，辣鸡 Apache 。辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡辣鸡

我参考过[这篇博客](http://blog.csdn.net/yaoxiaochuang/article/details/50902158)，但是这不是我想要的解决方案，我想直接找到可以用的替代 jar 。所以最后我找到了这里：

[天地良心](http://blog.csdn.net/mengfei86/article/details/8155544)，它提供了一个修复好问题的 jar 。我就懒得再下载一次源码再改了，放个博客免得后人吃亏。

啥时候无聊了再把 1.2.1 修复了再编译一个扔 JitPack 。
