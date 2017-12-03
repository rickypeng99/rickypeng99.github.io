---
layout: post
title: 传教之 IntelliJ IDEA 第一章： IntelliJ IDEA 的下载与安装
category: IntelliJ
tags: Java, IntelliJ IDEA, JetBrains
keywords: Java,IDEA,IntelliJ,PhpStorm,WebStorm,PyCharm,Rider,RubyMine,CLion,
description: IntelliJ IDEA for beginners chapter 1, About IDEA
---

经过长期的考虑，我决定写一篇自己的 IntelliJ IDEA 教程，希望能帮到大多数想用 IDEA 编程的同学们～

本篇教程同样适用于任何 JetBrains 公司出品的其他 IDE ，包括 PhpStorm ， WebStorm ， PyCharm ， Rider ， RubyMine ， CLion 等。

## 依赖

- JDK

## 搭建环境

找到[JetBrains 的官网](https://www.jetbrains.com)，找到 IntelliJ IEDA ，并下载免费的 community 版本。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea_on_web.png)

当然 JetBrains 也是有[中文官网](http://www.jetbrains.com.cn)的，上面还有部分内容是我翻译的。如果你英语死得比较早或者只是单纯地喜欢冰封的话也可以上这里下载。

截止本文发布， IDEA 最新版本是 2016.1.3。(2017.10 更新： 现在是 2017.2.4)

因为仅仅是个下载安装，不需要具体说明了，人类都会的，对吧。

另外，任何有官网的软件都该上官网下载。

## 说明

+ JDK 是开发 Java 所必须的工具，它即包含了 Java 的开发工具，也包含了 Java 的运行环境。所以要运行 IntelliJ IDEA 必须要 JDK 才行。
+ IntelliJ IDEA 有两个版本，免费的叫 community ，社区版，针对 JavaSE 开发以及 Android 开发，还有集成的版本控制，还支持大量的语言(包括萌萌哒 Kotlin)，更多的资源可以通过那些优秀的插件扩展实现。另一个是付费的 Ultimate ，最终版，包含了 JavaEE 和数据库功能。


## 如何操作？

首先打开 IDEA ，点击 create new project ，选 Java。一路下一步，最后创建成功。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea1/0.png)

一路下一步，并输入项目的名称。最后点击 finish ，稍等片刻就创建成功了。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea1/1.png)
![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea1/2.png)

(我写这段的时候一直觉得自己是在侮辱读者智商。。大家都是 Java 程序员。。。哈哈。)

接着，<kbd>Alt</kbd>+<kbd>1</kbd>，你会在左边看到文件目录树。

然后随便在 src 里面右键，选 New -> Java Class。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea1/3.png)

此时弹出一个窗口，让你输入文件名。随便输入一个 Main 吧。我就不截图了。

在弹出的编辑界面中，会出现一段 IDEA 帮你创建好的代码。

大功告成，你已经认识了 IntelliJ IDEA 了。

关闭 IDEA ，请选择任务栏的 File -> exit。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea1/4.png)

## 你学到了什么？

1. IntelliJ IDEA 的下载与安装。
1. IntelliJ IDEA 的打开与关闭。
1. 如何使用 IDEA 创建项目。
1. 快捷键<kbd>Alt</kbd>+<kbd>1</kbd>，用于打开或者关闭文件目录树。

