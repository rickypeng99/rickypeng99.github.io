---
layout: post
title: IntelliJ IDEA 进阶教程： 语言注入
category: IntelliJ
tags: Java, IntelliJ IDEA
keywords: Java,IDEA, PhpStorm,WebStorm,PyCharm,Rider,RubyMine,CLion,Android Studio,JUnit
description: IDEA advance chapter 5
---

我真的太久没发 IntelliJ 的教程了，最近 Sakura 同学找我帮他配 IntelliJ ，~~我秀了一下技术，假装自己是老司机~~。
然后发现 Language Injection 这个非常好用的功能我居然没写教程（很明显，一堆人不知道这个东西），
于是我又开始写教程了。

本文多图。

愚人节快乐。本文不愚人。

## 本文主要内容

+ 语言注入
+ 文学编程
+ 测试代码中的正则
+ 测试代码中的 SQL 语句
+ 在 Markdown 中的使用

## 卖萌

~~想必各位都知道什么是**文学编程**~~

## 正文

### 基本用途

**文学编程（ Literate programming ）** 用最简单的方式解释其实就是
把代码写进文档，然后提取代码运行。知乎用户[bhuztez](https://www.zhihu.com/people/bhuztez)（不撸兔子）
（现已被永久封号）说过他为了验证*21 天学通 Erlang*里代码的正确性，写了个程序把书里面的代码抠出来，
然后分别验证运行结果和书上说的是否一致。

嘛，这差不多就是文学编程了（其实这只是很偏颇的理解，详情请看
[Wikipedia](https://en.wikipedia.org/wiki/Literate_programming)，
但是和本文关系不大），那么为什么我要说这个呢？

因为 IntelliJ IDEA 有一个功能，可以讲代码检查**注入**到一些常量当中。
这些常量在大部分情况下，是代码里的注释和字符串常量。

举个例子，我们在 IntelliJ 里面写：

```kotlin
/*
class Main {
 public static void main(String[] a) {
   System.out.println("Hello World");
 }
}
*/
object Main {
  @JvmStatic
  fun main(a: Array<String>) {
    println("Hello World")
  }
}
```

我写在注释里面的是一段等效于下面的 Kotlin 代码的 Java 代码，我这时只能通过大脑编译它。
万一写错了，读者找你撕逼可是很麻烦的呀。

#### 步骤

所以说 IntelliJ IDEA 提供了一个很方便的功能叫 Language Injection。操作步骤：

0. 在要注入的地方（注释，字符串， etc.） <kbd>Alt</kbd>+<kbd>Enter</kbd>
0. 选择 Inject Language or Reference
0. 选择要注入的语言
0. Enjoy

#### 例子

我们来看看这个例子，首先在上面的注释里面 <kbd>Alt</kbd>+<kbd>Enter</kbd> ：

![Alt+Enter](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/0.png)

然后选 Inject Language or Reference ，然后选语言。这里根据我们的需求，选 Java ：

![Choose Java](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/1.png)

然后就可以看到高亮出来了，左边也多了一个并不能按的运行按钮：

![See highlight](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/2.png)

如果写一些调皮的代码，也会出现报错：

![See highlight](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/3.png)

之所以前面的代码没有报错，是因为此处 IntelliJ 关闭了对于外部类的检查，因此：

+ **IntelliJ** 被视为一个类
+ **IDEA** 是变量名
+ **boy** 是一个函数/变量
+ 后面的就什么都不是了，所以有一个报错

代码补全也有了：

![See highlight](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/4.png)

Live Template 也有了：

![See highlight](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/5.png)

重构功能也有了：

![See highlight](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/6.png)

注意，上面那个对 233 这个字面值的 Unused 也检查出来了。

看起来是不是很棒？这有点文学编程的味道了吧？

顺带一提，上面的代码其实是错的，下文再解释。

如果你的代码有伪代码成分，可以取消语言注入。直接 <kbd>Alt</kbd>+<kbd>Enter</kbd> 然后选 Uninject Language 开头的那个就好啦。

那么运行呢？我想运行代码看看效果怎么办？

#### 运行

在 Inject 了的代码块中 <kbd>Alt</kbd>+<kbd>Enter</kbd> ，选 Edit [语言] Fragment ，

![Edit Fragment](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/7.png)

可以看到蹦出来了一个窗口，里面就是这段代码的碎片。

![Edit Fragment](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/8.png)

这时 IntelliJ 就会检查依赖了，说找不到 Random 这个函数。此时就显示出了~~我写了多久 Kotlin~~静态分析的重要性了。

我们进行重构，先把 new 加上，然后把 Random 类给 import 进来，可以看到 import pop up 都有了，然后加上 nextInt()的方法调用：

![Fragment Refactor](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/9.png)

上下代码是同步的，下面的编辑了上面的也会变：

![Fragment Changes](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/10.png)

### Markdown 支持

这功能在写文档的时候很方便， IntelliJ 的官方 Markdown 插件会在 Markdown 代码块中强制注入你所选的语言，举个例子：

![Markdown Injection](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/11.png)

而且在写 Markdown 的时候也会有这样的补全：

![Markdown Completion](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/12.png)

非常方便不是吗？（可惜是强制注入）

### 正则和 SQL 支持

想必大家在写代码的时候代码里面肯定会出现很多 SQL 语句，或者正则表达式，有时它们会被 IntelliJ 识别出来，有时不会，比如：

![Reg](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/13.png)

#### 正则注入

**而且这个正则表达式的支持真的太方便了！**

先对正则表达式 <kbd>Alt</kbd>+<kbd>Enter</kbd> ，选 Check ：

![Reg1](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/14.png)

然后可以测试正则表达式，比如上面那个我随手写的 16 进制检测：

![Reg2](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/15.png)

和调皮的测试，会报 Not matches ：

![Reg3](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/16.png)

要让上面那个没被识别的字符串也可以进行这样的正则检测，可以对它注入 RegExp 语言（就是正则表达式），
这样就会被识别为正则表达式了：

![Reg4](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/17.png)

这时你会看到一个提示，让你加个 annotation ，这样在别的地方也会直接被识别出 Language Injection ：

![Reg4](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/18.png)

```kotlin
fun main(args: Array<String>) {
	@Language("RegExp")
	val rg = "0[xX]([0-9]|[a-f]|[A-F])+"
	val reg = Regex("0[xX]([0-9]|[a-f]|[A-F])+")
}
```

然后就可以进行 check regexp 了：

![Reg4](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/19.png)

同理，我们有时候会看到被识别出的 SQL 语句：

![SQL1](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/20.png)

它还会提示你选择对应的数据源，如果是查询语句，可以直接对查询语句进行测试。

同理，我们也可以对 SQL 字符串直接注入：

![SQL2](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/21.png)

注释也可以注入：

![SQL3](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/7/22.png)

但是注释不能通过 annotation 来保留这次注入。

## 本文完

祝大家愚人节快乐，早日成为女装大佬。
