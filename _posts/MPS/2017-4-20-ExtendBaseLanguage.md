---
layout: post  
title: 突然 MPS 教程（五），扩展 Java
category: MPS
tags: MPS,Java
keywords: MPS,Java,BaseLanguage
description: extending java in mps
---


话说我一开始时就是抱着肯定没人看的心情写的这个系列，
不过写了之后居然还是有不少人向我反馈表示在看，我还是很开心的。

知乎有一哥们私聊找我，问我能不能用 MPS 扩展其他语言。答案当然是可以的，不过我的教程里面似乎还没有，
所以我就临时发布了这篇教程。

众所周知，在 MPS 中，有一个语法和 Java 一样的内置语言叫做`BaseLanguage`，一般情况下，我们编写代码，
让 MPS 把 AST 给 map 成`BaseLanguage`代码，然后编译为文本形式的 Java 代码。

## 这次说什么

在这篇教程中，我们将模块化我们的 Generator ，并使我们能在`BaseLanguage`当中写我们的语言的代码。

如果你做了[上一篇博客的作业](../../../../2017/04/12/MakeSimpleLangWithMPS/#还能这么玩)
的话，你就可以体验一把`在 Java 里面写 C#`的感觉了。虽然这么有点不好（估计会引发一场巨大巨大的战争），
但是你看懂了这篇教程并跟着来了一波之后，你就已经可以任意地扩展`BaseLanguage`的语法了。

我在写博客之前先验证了一下自己的想法，最终出来的代码是这样的：

```java
public class Ice1000 {
  public static void main(string[] args) {
    Console.WriteLine(" Fuck Zhihu Editor ");
    Console.WriteLine(" This is C# code ");
    Console.WriteLine(" Fuck Java ");
  }
}
```

再次提醒， MPS 的 LOP 中，`语言`的概念早已被弱化，你编辑的不是代码，是 AST。

然后我刚写到这的时候我的朋友[Glavo](https://github.com/Glavo)说混合风格看着吐血。

于是为了再恶心他一把，我把语法改成了 Lisp 风格。见下代码：

```java
public class Ice1000 {
  public static void main(string[] args) {
    (println " Fuck Zhihu Editor ")
    (println " This is C# code ")
    (println " Fuck Java ")
  }
}
```

## 模块化之前的 Generator

我们回顾一下，上次我们整了个 Generator ，它直接在一个`map_PrintlnSet`里面对`PrintlnSet`所有的`Println`
进行一个 map 操作，把它转化为 Java 代码。这里我们应该先把`Println`的 CodeGen 做成一个模块，让它可以被用于`BaseLanguage`和
`PrintlnSet`两种语言。

### 导入依赖

首先我们需要导入依赖，在`VerboseLang`中的`Dependency`选绿色加号，找到`BaseLanguage`，选择，
并像这样把`Scope`选成`Extend`，代表这门语言扩展了`BaseLanguage`。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/0.png)

然后我们让`Println`继承`Statement`，而不是之前的`BaseConcept`。

```
concept Println extends Statement
                implements <none>

instance can be root: false
alias: p
short description: <no short description>

properties:
content : string

children:
<< ... >>

references:
<< ... >>
```

### 新建一个子 Generator

然后我们跑到 Generator 那里，创建一个`reduction rule`， Concept 选`Println`，

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/1.png)

然后在右边的那个红光满面的地方<kbd>Alt</kbd>+<kbd>Enter</kbd>，选择新建一个模板。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/2.png)

然后在模板里面新建一个`Statement`。注意，这里的模板都是`BaseLanguage`的模板。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/3.png)

因此，你可以直接在里面写 Java。比如，输入`sout`，出来一个`System.out.println();`。

然后选中整块代码，加上一个`Template Fragment`，表示这部分是一块模板（你可以只选中一部分作为模板，剩下的部分用于满足静态分析，
保证语法正确而已）：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/4.png)

最后我们把这段代码补全成我们之前写的那样（就是在字符串那个位置加一个
`对 node 的 content 进行 map 的 macro`，和我之前在讲 Generator 的时候操作一致）：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/5.png)

完了应该是这样：

```java
<TF [System.out.println("$[Fuck zhihu]");] TF>
```

### 使用这个子 Generator

然后我们转到`map_PrintlnSet`，让它调用这个`Template Fragment`。

首先把上次写的都删了，重新整个`LOOP MACRO`：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/6.png)

然后把再选中里面的整个语句，给它加上一个宏，然后看到左边俩红色美元符号中间报错：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/7.png)

我们在这里选择名叫`COPY_SRC`的宏，表示直接把源码抄过来。完了应该是这样的：

```java
public class map_PrintlnSet {
  public static void main(string[] args) {
    $LOOP$[$COPY_SRC$[System.out.println("Fuck Zhihu");]]
  }
}
```

也就是说 MPS 还有更高级的抄源码的方式，不过本文不会说的。~~因为懒。~~

现在编译一下语言，回到我们之前写的那个粗鄙的`Sandbox`，右键`Preview Generated Text`，应该是没问题的，
运行也应该没问题。如果有问题，请点击菜单栏的`Build -> Rebuild Project`。

## 写一些 BaseLanguage

现在我们在我们的`Sandbox`里面导入`BaseLanguage`，然后 rebuild 一下，这样我们就可以在这个`Sandbox`里面写
`BaseLanguage`的代码了：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/8.png)

然后新建一个`class`：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/9.png)

无论如何你都应该会写这些东西了：

```java
public class BaseLanguageClassUsedForTesting {
  public static void main(string[] args) {
    <no statements>
  }
}
```

## 在 BaseLanguage 里面使用我们刚才定义的东西

注意，我们之前写`Println`这个 Concept 的时候，曾经为它起过一个 alias 叫`p`。
我们要记住它，然后在`<no statement>`处，<kbd>Alt</kbd>+<kbd>Enter</kbd>，输入这个 alias （我是`p`所以就输了`p`）：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/10.png)

然后你就惊喜地看到了我们之前写的 Editor 的东西出现在了这里！

```java
public class BaseLanguageClassUsedForTesting {
  public static void main(string[] args) {
    (println " <no content> ")
  }
}
```

随便写点什么玩玩吧。你现在已经成功地扩展 Java 了。

## 作业

这次的作业留一个比较难的，

```
扩展 BaseLanguage ，把整个 PrintlnSet 也塞进去。
```

要求：

0. 在 PrintlnSet 的 Generator 中调用 Println 的
0. 把 PrintlnSet 原本的 root Generator 换成对 PrintlnSet 的 Generator 的调用

也就是说确保所有代码都只写了一次，复用所有能复用的模块。

也就是说你要做成这样（我自己也实验了一下，是可以的，我把语法改成了我最近写的比较多的 Lisp 风格（最近比较沉迷 Lisp 啊））：

+ Sandbox1:

```lisp
(run-all|> 
    (println " Fuck you ZhiHu Editor!!!! ")
    (println " My name is Van, I'm an artist. ")
    (println " I'm a performance artist. ")
)
```

这个不算难，类似的事情我们上次已经做过了。

+ Sandbox2:

```java
public class Ice1000 {
  public static void main(string[] args) {
    (println " Fuck Zhihu Editor ")
    (println " This is C# code ")
    (println " Fuck Java ")
    (run-all|>
        (println " Zhihu's Editor is anti-human ")
        (println " MPS is a good IDE ")
        (println " Language-Oriented Prorgamming is good! ")
    )
  } 
}
```

这个比较骚，难度也比较大。我决定上传[我自己做的版本](https://www.jianguoyun.com/p/DedkD_UQl_iYBhiEzCo)，
你们可以做完作业之后对答案。至于能不能成功导入就看你的运气了。

这是我做的那个版本在 MPS 里面的样子：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/11.png)

## 再说说 MPS 的好处

今天又有人问我 MPS 解决了什么问题，然后我又听到了这样的言论：

> 啥也没解决，就是给你了个非文本 parser 的 parser generator。

好吧我就随口说说，反正你们都觉得是垃圾。

+ 不会编程的人不知道编程时很多细节，导致 UI 和程序员互肝
+ 文本编辑器还得 Parse 你的代码，实现不一样的 Parser 可能结果不一样（参考 IntelliJ Scala ）太烂
+ Parser 处理不了有歧义的语法， MPS 可以写出有歧义的代码
+ MPS 可以在代码里面画图表，画控件，文本的代码不行
+ 一门语言的语法固定了，除非操编译器，否则不能加语言特性， MPS 可以

然后我说，

> 要不是写教程，我做刚才那个东西只需要两分钟

然后对方说，

> 我写个 yacc file……哦，写个 bnf 两分钟都不到。

这个故事未完待续，你们可以围观我们俩傻逼撕

## 更新

[撕逼道具做好了，你们可以下载了看，我就不信他能做出这个](https://www.jianguoyun.com/p/DaB6-NQQl_iYBhiSzCo)

下载之后改下 Demo ，我写丑了，但是语言没问题。

预览效果，你也可以把下载的 Demo 改成这样：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/12.png)

运行结果：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/13.png)

## 更新 2

最后我图个乐呵，把它弄成这样了：

0. 字符串必须含 Fuck 子串不然报错
0. 带图片

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/4/14.png)

yacc 选手，请继续你的表演。
