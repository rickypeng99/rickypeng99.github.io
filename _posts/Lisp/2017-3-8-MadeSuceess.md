---
layout: post
title: 昨天说的编辑 AST 并导出代码做出来了
category: Lisp
tags: Lisp
keywords: Lisp,Java,Lice
description: made tool 4 lice
---


## 昨天说的编辑 AST 并导出代码做出来了

看起来我并不是二倍根号二脚猫而是 lg(300π)脚猫啊。

注意，只是实现了编辑现有结构的 AST 的节点内容，
现在还没有做到增加和删除节点（人太傻，不会）。

使用方法：

首先打开上次说的那个工具中的 Syntax 那个，选择一个文件：

![file chooser](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/1/6.PNG)

然后你会发现底部多了一个按钮（好吧其实等你们看到这篇文章的时候
我早就把这些全搞定了所以说你看不到之前那个没有该按钮的版本）。

![export button](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/1/7.PNG)

我们先做一件事情。对着那个 fib 狂点，可以看到进入了编辑状态。
我们把它改成 fibonacci （回车提交），然后下面两个 fib 也一样，
然后点一下 Export Lice Code。

![renaming](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/1/8.PNG)

什么也没有发生。但是我们再看看这个文件（比如上面那个例子中的 math.lice ）：

![file view](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/1/9.PNG)

你会发现这里多了一个文件。打开它：

![edited file](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/1/10.PNG)

我觉得我这个缩进还是做的不错的对吧？

而且代码实现也很简单，目前这个小工具总
[代码](https://github.com/ice1000/lice/blob/master/tools/src/lice/tools/SyntaxAstViewer.kt)
量还没超过 100 行（去掉 import 和注释）

核心实现还是对那棵树进行 map 操作，然后映射出另一个树，再拿它进行 Code generation。

非常简单对吧？看来我昨天说的还是一件很简单的事情。
有了这个功能，这个工具就超过[@lfkdsk](https://github.com/lfkdsk)
给他的 HobbyScript 写的彩蛋了——他那个只能输出语法树，
我这个输出了还能编辑，还能导出回去。

导出了还有缩进。

在写完这篇文章之后，我又给它加了个特性，就是顶级作用域的函数调用我给增加了一个换行，
也就是说生成的代码是这样的：

```lisp


(def exp-mod a b m
  (|>
    (-> ret 1)
    (while
      (!= 0 b)
      (|>
        (if
          (!= 0
            (& b 1))
          (-> ret
            (%
              (* a ret) m)))
        (-> b
          (/ b 2))
        (-> a
          (%
            (* a a) m)))) ret))

(def try-it a n
  (==
    (exp-mod a n n) a))

(def fermat-test n
  (try-it
    (+ 1
      (rand
        (- n 1))) n))

(def say n
  (println n " => "
    (fermat-test n)))

(force|>
  (say 101)
  (say 233)
  (say 777)
  (say 273489)
  (say 34789)
  (say 185121)
  (say 2)
  (say 3)
  (say 5)
  (say 7)
  (say 19)
  (say 666) "tests finished")
```

有时这破玩意会出现一个鬼迷日眼的问题，就是那个按钮失踪了。我也不知道咋回事，遇到这种情况重启试试？（

根据生成器的行为可以很容易的看出源码的逻辑：

```kotlin
typealias UINode = DefaultMutableTreeNode

// @JvmOverloads
private fun mapDisplay2Ast(
    node: UINode,
    gen: StringBuilder,
    numOfIndents: Int = 0) {
  if (numOfIndents == 0) gen.append("\n")
  when {
    node.isLeaf -> gen
        .append(" ")
        .append(node.userObject.toString())
        .append("")
    else -> {
      gen
          .append("\n")
          .append("  ".repeat(numOfIndents))
          .append("(")
          .append(node.userObject.toString())
      node.children()
          .toList()
//          .map { it as UINode }
          .forEach {
            mapDisplay2Ast(
                it as UINode,
                gen,
                numOfIndents + 1
            )
          }
      gen.append(")")
    }
  }
}
```

喜欢吗？快来投入 Lice 的怀抱~（逃 ε=ε=ε=┏(゜ロ゜;)┛

生活真是无聊，我现在算是彻底找不到事情干了。还是老老实实回去看书吧。
下周把 JavaCC 拷过来研究一下 Parser Generator ，
说不定可以造出一个更牛逼的语言呢（逃

或者说给 Lice 写个库/拿来做 SICP 习题也是不错的啊（继续逃

可惜 Lice 现在还不支持函数式编程，我现在也不想再去改解释器代码了。哎。
反正就我看来是没 bug 可找的。欢迎 GitHub 开 issue 撕逼。更欢迎 pull request 撕逼。
