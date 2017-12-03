---
layout: post
title: Kotlin 命令行环境搭建
category: Kotlin
tags: Kotlin
keywords: Kotlin
description: Kotlin command line
---

打开 IDE 是件很麻烦的事情，我们都喜欢命令行，但是怎么搭建 Kotlin 命令行环境呢？这是个非常严肃的问题。

本文针对 Windows 。当然其他系统也不是不能用，仅供参考。

## 准备

+ IntelliJ IDEA 或者装好 Kotlin 插件的 Android Studio
+ cmd.exe

然后找到你的 Kotlin 编译器。

### IntelliJ IDEA

打开 `[IDEA 安装目录]/plugins/Kotlin/kotlinc` 并把这个目录拷到外面某个路径不含空格的地方。

### Android Studio

打开 `[用户目录]/[Android Studio 配置文件]/config/plugins/Kotlin/kotlinc`
并把这个目录拷到外面某个路径不含空格的地方。

你应该拷出来了个这样的东西：

```yaml
root:
  - bin:
    - kotlin.bat
    - kotlin
    - kotlinc.bat
    - kotlinc
    - kotlinc-js.bat
    - kotlinc-js
    - kotlinc-jvm.bat
    - kotlinc-jvm
  - lib:
    - 一堆 jar
  - license:
    - 一堆 txt
  - build.txt
```

然后把这个 `root/bin` 目录添加到环境变量 `Path` 中。

然后就可以使用了。在命令行输入 `kotlin` 以确定你成功搭建了环境。

如果你遇到类似这样的情况：

```batch
C:\>kotlin
'[一个不完整的目录]' 不是内部或外部命令，也不是可运行的程序
或批处理文件。
```

那你应该是把它放进了含空格的目录，换个目录吧。

如果输出了：

```batch
C:\>kotlin
error: please specify at least one name or file to run
```

那么恭喜你。

## 打开 REPL

其实更简单，直接输入 `kotlinc` 即可。

```batch
C:\>kotlinc
Welcome to Kotlin version 1.1.2 (JRE 1.8.0_111-b14)
Type :help for help, :quit for quit
>>> println("Hello Kotlin")
Hello Kotlin
>>> val kotlin = "Kotlin is awesome!"
>>> println("Hey boy, $kotlin")
Hey boy, Kotlin is awesome!
>>>
```

## 退出 REPL

很明显不能 `exit` 。不过<kbd>Ctrl</kbd>+<kbd>C</kbd>比较粗野，请文艺地使用 `System.exit(0)` ，或者 `:quit` 。

```batch
C:\>kotlinc
Welcome to Kotlin version 1.1.2 (JRE 1.8.0_111-b14)
Type :help for help, :quit for quit
>>> exit
error: unresolved reference: exit
exit
^

>>> System.exit(0)
C:\>
```
