---
layout: post
title: IntelliJ IDEA 进阶教程： 自定义代码模板
category: IntelliJ
tags: Java, IntelliJ IDEA
keywords: Java,IDEA, PhpStorm,WebStorm,PyCharm,Rider,RubyMine,CLion,Android Studio
description: IDEA for beginners chapter 1
---

其实是我在张哥（ stormzhang ）博客看到的一篇文章中讲到的一个黑科技，但是张哥并没有把这个玩意说完整，
只是简要地提了一下。然后我就去研究了一下这玩意，发现很好用。

## 这玩意是啥
其实就是之前我曾经说过的那个自动补全中的黑科技，比如在 Java 中输入 psvm、sout、psfs、fori ，
在 Android 工程中输入 Toast、在 Kotlin 和 Scala 中输入 main 等，它会自动补全一段模板中的代码。

你在 Kotlin 工程中输入 main ，会自动补全出 Kotlin 风格的 main 方法。这就是这个 Live Template 的作用。

之前辣鸡 Gayvo 还在看到 Scala 的 main 方法补全自动生成了显式声明的 Unit 返回类型而开始说 IDEA 辣鸡，我只能呵呵。这玩意显然是可以改的。

## 咋用
直接在代码中输入就会看到补全。

## 咋自定义
首先我们打开设置，<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>S</kbd>。请事先关闭 QQ 快捷键。
然后找到 Editor 目录下的 Live Template 选项。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea5/0.png)

然后看到这里一大堆语言选项。我就选自己最熟悉的 Kotlin 啦。。。你们自便。点击左边的三角形，
展开查看现在有哪些模板吧。我之前说过的 `psvm`、`main` 都在里面，还有 `fori`、`anonymous`、`lambda`、`ifn`、`inn` 等。

任意点击其中一个，可以看到下面的模板代码。你可以看到很多变量，像宏一样。变量以美元符号夹在中间。
首先试试修改模板内容，然后再在编辑器中键入模板内容，是不是发现了变化呢。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea5/1.png)

那么我们新建一个。之前拿 CLion 写 OI 代码时发现没有 main 方法的补全真的是人生一大憾事，
于是我准备自己造一个。点击最右边的绿色加号，你懂的，选 Live Template。

然后在下面三个空中，左上的框是你的快捷键内容（就是输入这个框中的内容，会提示出模板代码）。右上是介绍，这个介绍不会对 Live Template 的表现产生影响，就是代码提示时出现的类似 Hint 的东西。然后最下面那个就是模板本体了。

比如，我们首先在左上的框框中输入```main```，然后在右上的框框中输入```insert a main funtion```，表示插入一个 main 函数。然后在下面输入 C 语言 main 方法的内容：

```c
int main(int argc, char *argv[]) {
	return 0;
}
```

然后你会惊喜地发现，它说你没有定义可用范围。于是我们选那个蓝色的 Define ，然后在弹出窗口中选 C 和 C++。然后你就看不到报错了。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea5/2.png)

然后保存设置，回到编辑器，发现你已经可以插入 main 方法了。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea5/3.png)

然后你惊喜地发现，你只是插入了一段代码，插入过后光标在最后。这样的体验是非常糟糕的。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/idea5/4.png)

于是我们要学习那个美元符号。

## 定义宏
我们先试试一些有特殊意义的宏。比如`$END$`。把模板改成：

```c
int main(int argc, char *argv[]) {
	$END$
	return 0;
}
```

然后重新开始编辑。相信你已经发现问题所在了——补全完成之后光标移动到了`$END$`所在的位置！现在这个模板更好用了。

然后你试试随意写一个宏，比如`$ICE$`。然后你再回到编辑界面。试试效果。这个和<kbd>Shift</kbd>+<kbd>F6</kbd>重命名的效果很像。回车确定。

这个有什么用呢？我们来试试定义一个 for 循环看看吧。由于 CLion 已经内置了类似下面这种 for 循环的模板：

```c
for (int i = 0; i < n; ++i) {
	$END$
}
```

我们来造一个外部定义循环变量的 for 循环。因为我经常在代码开头定义`int i, j;`
然后在代码内部不使用上面那种写法，每次使用模板都需要改一改生成的内容。于是我们看到下面这段模板。

```c
for ($INDEX$ = 0; $INDEX$ < $EDGE$; ++$INDEX$) {
	$END$
}
```

注意观察，`$INDEX$`这个宏我用了多次。然后你会在编辑器中惊喜的发现，你输入一次`$INDEX$`的内容，
所有`$INDEX$`都被包含了。当你回车确认输入完成时，光标跳到了`$EDGE$`，再次确认之后光标进入循环体。

现在你大概知道这个宏怎么用了吧。同名宏、内置宏。大概也就这几个比较特殊的概念。别的都很简单。

这让我再一次认识到了 IntelliJ IDEA 系列的神奇。



