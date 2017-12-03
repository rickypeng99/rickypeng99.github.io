---
layout: post
title: 传教之 IntelliJ IDEA 第三章：代码补全中的小技巧
category: IntelliJ
tags: Java, IntelliJ IDEA
keywords: Java,IDEA,IntelliJ,IntelliJ IDEA,NetBeans
description: IntelliJ IDEA for beginners chapter 3, some code completing tricks
---

请读者在阅读本篇博客之前学习一下 Java 语言，因为本篇教程是面向有 Java 基础的读者的。不过不用担心，你不需要知道太多东西。Java 学到 OOP 那个程度就行了。本文主要内容是一些 IDEA 中灵活运用代码提示的东西。

## 依赖

- IntelliJ IDEA

## 开始

你可能会问，代码提示还有啥灵活运用的方法？没关系，如果你对于 IDEA 一无所知的话，本文能让你对 IDEA 的爱更上一层楼~~

现在打开之前创建的那个空项目。还记得之前的 Main.java 吗？打开它。代码大概是下面这样的：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea3/1.png)

没错，只有一个 Main 类，里面也是空的。上面一坨是注释，不用管。现在我们就要在这里做实验了，准备好你的狗眼，我要开始了。

## 缩写补全

还记得每次运行 Java 程序都需要输入一遍 
```java
public static void main(String[] args) {
}
```
吗？难道你就不厌烦吗？明明是非常常用的一段代码，这么长一大段每次都要打好久啊！所以 IDEA 作为最屌的 Java IDE 为你提供了贴心的缩写补全功能。

试试输入：**psvm**四个字母。然后你会看到这个提示：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea3/2.png)

敲下你高贵的回车，选择这个宿命中的提示。然后你就直接插入了之前你已经敲烦了的一大段代码——

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea3/3.png)

愉快吗？

下面列出一些别的常用的类似的缩写。

缩写|补全内容
:---:|---:
**psvm**|public static void main(String[] args){}
**sout**|System.out.println(); **(在 Kotlin 中是 println())**
**souf**|System.out.printf();
**serr**|System.err.println();
**psf**|public static final
**psfi**|public static final int
**psfs**|public static final String
**toast**|Toast.makeText(this, "", Toast.LENGTH_SHORT).show(); **(仅限 Android)**

赶紧试试吧。

这些功能根据我的朋友的说法， NetBeans 也具备，看来这只是一个普通的功能，于是我还得拿出更多杀器啊。

## 快速构建

这个功能是为一些手速比较慢的同学提供的。

比如你现在有一个数组或者集合，我们这里就以一个集合举例吧。冰封最喜欢用 ArrayList。我们敲下这样一段代码：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea3/4.png)

敲下你高贵的回车，选择这个宿命中的提示。然后你就直接插入了之前你已经敲烦了的一大段代码——

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea3/5.png)·

愉快吗？再敲一次回车，确定迭代变量名。我随手打了个输出的代码，然后我们看到聪明的 IDEA 这时有话要说了。黄色的波浪下划线，
这是 IDEA 对你的代码有意见的证明。这其实是我在写博客时的小插曲，不过这也顺便成为了本篇博客的内容。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea3/6.png)

还记得我[之前的博客](http://ice1000.github.io/2016/06/26/LearnIDEA2.html)里提到的快捷键吗？将你的光标移到 IDEA 有意见的地方，
按下<kbd>Alt</kbd>+<kbd>Enter</kbd>快捷键。

> IntelliJ IDEA ，有什么意见就告诉我吧！

然后你看到了 IDEA 亲切的提醒。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea3/7.png)

看到了吗？人家让你换成 forEach。于是我们就换吧。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea3/8.png)

听我的朋友说，这个功能 NetBeans 也有……于是我崩溃了。

> 看来主流三剑客是，你出了一个新功能，我下一个版本就加上去……

说实话这样的话粉丝们会吵起来啊……不过没关系，我们继续信仰我们的 IntelliJ IDEA。以后会有更加独特的功能的说明。

（话说真是谢谢我这位曾经的 NetBeans 用户朋友，他在我的写作过程中给予了相当多的关于 NetBeans 的指导，非常谢谢他！

## 你学到了什么？
1. 一大堆缩写补全
1. 快速构建常用代码结构
1. 认识 IDEA 的辅助编辑功能

（别吐槽只有三个，这三个都可以大幅提高你的编码效率