---
layout: post
title: 简单拿 Lice Clojure 在相同的方面对比一下
category: Lisp
tags: Lisp
keywords: Lisp,Kotlin,Clojure
description: My first lisp with Clojure
---

## 为什么我这么快又发一篇

+ 因为我刚刚看了 40 多页的 Programming Clojure
+ 因为我发现 Lice 和 Clojure 很多设计是相似的，我很兴奋

## 为什么我的眼里常含泪水

+ 因为 Markdown 钦定 Tab 为 8 空格
+ 我的代码变得根本不能看了

## 我还是说正事吧

既然都是 Lisp 方言，基于 S-Exp ，而且都是 JVM 上的实现。不管是我这种解释性的，还是 Clojure 那种编译型的，都有很多因为 JVM 而存在的共同特征，比如 Java 风格的异常处理， Exception 类， StackTrace 等。

因此，在写自己的 JVM Lisp 的时候，参考一门现有的 JVM Lisp 是非常有价值的。

我今天趁着补课的时间看了 40 多页的 Programming Clojure （为什么我又废话了一遍），看到很多和我一样的设计：

+ repl 遇到 Exception 的时候只输出第一句，然后保存 Exception 类到一个特定的变量位置，给出一个 pst 函数来输出完成的栈帧信息（我之前也想起名为 pst ，但是我感觉 pst 这个名字太邪乎，陪审团？拍死他？当时采用了 show-full-message 这个名字。现在我又改成 pst 了。
+ println 返回 null 。我一开始也是这么干的，但是后来我给改成返回输出的字符串了。
+ 通过(函数名 receiver 参数)来调用一个 JVM 方法/函数。我的构想和 Clojure 的实现几乎一模一样。

当然也有很多不同的地方，比如我的 repl 有几个指令是内置的，作为特殊指令存在，而 Clojure 那个是函数。

当然了，编译型语言和解释性语言本身就是有很大区别的。

所以说啊，我还是需要学习一个。但是搞出了一个基本能用的 Lisp 解释器还是很开心啊。我还模仿 JRuby 的 jirb 搞了个基于 Swing 的 JTexPane 的彩色高亮的 repl ，自己看着逼格还不错，只是主窗口并不能输入代码，只能在下面的 JTextField 里面输入。

这个 GUI 的 repl 通过 System.setErr setOut 来重定向了 println 和 System.err.println 的输出，但是我没能重定向 in 。

repl 输入的原理是监听回车键，然后把 JTextField 的文本清空，交给 Parser ，解释执行之后在窗口输出结果。

非常简单。

## 我说完了

废话连篇

## 于是我再说点什么来补偿你们吧

我准备写个 Lice 的教程，面向 Java 程序员，读者不需要 Lisp 基础。

### 好了你们就等着吧。。。

又要去和我妈撕逼了。。。。

## P.S.

加入了 GUI API 和更多的 List API ， 还有 String API 。现在可用性更好了。

于是在我简要改变了一下文件 API 之后，之前的那个代码已经不能用了，请参考[这个多线程爬取 vijos 题目的代码](https://github.com/ice1000/lice/blob/master/sample/test9.lice)。

repl 可以在[这里](https://github.com/ice1000/lice/releases)下载。

运行需要 jre 。

