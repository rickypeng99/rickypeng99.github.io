---
layout: post
title: MPS 教程一：环境搭建+试运行一个语言
category: MPS
tags: MPS
keywords: MPS, LOP
description: try shape language with MPS
---

本文高能，弱者慎入

## MPS 是什么

我们来看看 Infoq 上对 MPS 的介绍：

MPS 提供的软件开发环境可以创建新的定制语言，也可以扩展现有语言，然后用它们开发面向领域的应用。MPS 还可以定义新语言的类型系统、约束和专门的编辑器。MPS 用一棵抽象句法树（ AST ）来维护代码。
AST 由节点组成，节点又包含属性、子节点和引用，程序代码就靠 AST 和这些节点完整地表达出来。创建新语言的时候，开发者定义代码编排和表达的规则，还可以规定语言类型系统的组成元素。
MPS 凭借这些规则即时检查程序代码，减少用新语言编程的出错机会。MPS 还采用了代码生成的办法：用新语言在更高的层次上表达，然后 MPS 生成 Java、XML、HTML、JavaScript 等语言的可编译代码。
用 MPS 建立新语言的时候，必须从 BaseLanguage 扩展。MPS 已经提供了一些常用的 BaseLanguage 扩展，协助开发者处理字符串、容器、日期、正则表达式等语言成分。

MPS 采用的编辑器不是文本编辑器，而是**破界神编辑器(Projectional Editor)**。请原谅我使用这么中二的音译，但是之前的各种翻译（例如结构化编辑器）我觉得都太 2 了，于是我决定使用自己的翻译。

破界神编辑器是一个将序列化的 AST 根据语言创建者的意愿渲染为类似代码形式的编辑器，然后语言的用户编辑代码（编辑的过程和普通的文本代码编辑体验是不同的，这个虽然有点不同，但是习惯了之后会感觉爽的多），并实时地将编辑保存为 AST。在文件系统里， AST 是序列化的 xml。

也就是说， MPS 的开发过程比起普通的文本代码编辑要少了一个巨大巨复杂的步骤——Parsing。

破界神编辑是一把双刃剑。官方 Tutorial 说：

> Advantage:<br/> in less than a week of programming in the MPS editor people typically get back to their full speed of coding they experienced before in text-based IDEs<br/><br/>Disadvantage:<br/> projectional editing is highly addictive and you may ﬁ nd text-based editors less compelling and less helpful than you thought they’d been before

所以见仁见智了。而且 MPS 是开源的，如果你想要一个自己的 MPS ，完全可以去魔改。MPS 是 Apache v2.0 协议的。

## 本文使用的 MPS 版本

截止本文最后一次编辑，本文及本文提到的项目都使用 MPS EAP 2017.1。如果正式版出了那就使用正式版吧。

其实讲的内容都差不多，只是本文涉及一个项目，你需要使用和它使用的相同的 MPS 版本。我会在该项目 README 里面注明的。请以项目 README 为准。

## 学习 MPS 需要的知识基础

+ 对编译原理有少量的了解
+ 对 JetBrains IDE 常用快捷键高度熟悉（因为破界神编辑器）

以上两者都可以在学习 MPS 的时候顺便学习。

## 依赖

+ Git （为了下载项目）
+ MPS EAP 2017.1
+ 编译原理相关初级知识储备

这里给出一份[MPS EAP 2017.1 的 Windows binary 的下载链接](https://www.jianguoyun.com/p/DVPhGtYQl_iYBhjAoyg)，方便那群网络不好的家伙。

下载好 MPS 之后先 clone 这个项目，等会要用：

```bash
git clone https://github.com/ProgramLeague/ShapeBuilderLanguage.git
```

clone 完之后，确认项目目录有如下结构：

```yml
root:
  - languages:
    - ShapeLang:
      - ShapeLang.mpl
  - solutions:
    - Sample:
      - Sample.msd
```

其他文件暂时不管。然后安装 MPS ，并打开。

点击 Create New Project ，我们选择一个 Empty Project。如下图所示：

![new](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/0/0.png)

然后打开最左边 Project 选项卡的 Logical View ，选择 Test ，右键，点击最下面那个选项：

![config](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/0/1.png)

然后点击弹出的窗口最右边的绿色`+`符号，选择刚才你 clone 项目里面的`ShapeLang.mpl`文件。然后 OK。

现在你就成功导入 ShapeLang 这门语言了，可以在下面的 Modules Pool 的 Languages 里面看到。

## 准备工作

你需要一个纯英语输入的输入法。目的是，等会你需要大量使用<kbd>Ctrl</kbd>+<kbd>Space</kbd>这个快捷键，一般情况下中文输入法会冲突。

## 将这门语言导入 MPS

首先右键 Test-\>New-\>Solution。我们在 New 界面可以看到三个选项：

Option|Description
:---|---:
Solution|**使用语言**的东西，我们可以称之为**项目**
Language|语言
DevKit|暂时不管

我们新建一个 Solution ~~，随便起个草率的名字就好~~。

然后右键这个 Solution ，点击最下面的 Module Properties ，打开 Dependency 选项卡，添加这些依赖：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/0/5.png)

然后再给这个 Solution 新建一个 Model。右键它， New-\>Model。

![new](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/0/2.png)

然后给它起个名字。注意，名字必须是合法的 Java 包名。

![naming](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/0/3.png)

然后这时会弹出一个 config 的窗口，打开 Used Language 选项卡，加入这两个依赖。

![naming](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/0/4.png)

ShapeLang 是等会我们用来编程的东西， baseLanguage 是 Java 的 MPS 版。

## 开始编程

我们需要创建一个 Canvas ，如下所示：

![newing](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/0/6.png)

然后你可以看到编辑器里面出现了这样的东西：

![newing](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/0/7.png)

我们在空缺处填上必要的信息。注意，你此时可以感受到破界神编辑器和文本编辑器的不同之处。这时你需要记下这几个快捷键：

快捷键|功能
:---|---:
<kbd>Ctrl</kbd>+<kbd>Space</kbd>|补全（有些东西必须靠这个才能输入）
<kbd>Alt</kbd>+<kbd>Enter</kbd>|查看提示、建议
<kbd>Ctrl</kbd>+W|扩散选中
<kbd>Ctrl</kbd>+Shift+W|反扩散选中
<kbd>Tab</kbd>|进入 AST 下一个节点
<kbd>Shift</kbd>+Tab|进入 AST 上一个节点
<kbd>Ctrl</kbd>+F9|构建项目。是增量的
<kbd>Shift</kbd>+F10|运行刚才运行过的文件

可以试试<kbd>Ctrl</kbd>+<kbd>Space</kbd>的功能：弹出补全。

![completion](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/0/8.png)

我们在下面那个

```
<< ... >>
```

处使用<kbd>Ctrl</kbd>+<kbd>Space</kbd>，可以看到弹出一些补全。当然，我们也可以直接使用类似`Live Template`的功能：在编辑区输入`rect/circle/square/text`，你可以看到弹出了一堆东西，根据你的直觉填写相应的信息。回车之后可以输入下一个东西，建议广泛使用`Ctrl+Space`，以及`Tab`。

![completion](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/0/9.png)

好了，现在构建这个项目。<kbd>Ctrl</kbd>+<kbd>F9</kbd>。

![completion](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/0/10.png)

然后运行它。在文件树右键这个 NiceMPS ，点击 Run 开头的那一项。然后就可以看到运行结果了：

![completion](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/mps/0/11.png)

好了，你现在还可以再多折腾一下这个语言。你可以看到编辑区的颜色预览，不合法的数字报错（在 width height 那些地方输入负数）。这些都是 MPS 定制出来的。

## 第一篇教程就结束了？

## 不讲讲定义语言什么的吗？

没错，结束了。同学们再见。

