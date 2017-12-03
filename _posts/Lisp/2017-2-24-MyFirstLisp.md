---
layout: post
title: 人生第一个解释器， Lisp
category: Lisp
tags: Lisp
keywords: Lisp,Kotlin
description: My first lisp
---

## 为什么是 Lisp

+ 因为简单

## 为什么我会去写解释器

根据[萧井陌聚聚的说法](https://www.zhihu.com/question/22482295/answer/23508622)：

> 实现 lisp 语法的解释器(以后你可以拿这个金手指找别人约架...)

于是我去实现了一个 Lisp 语法的辣鸡语言的解释器。

## 为什么我要写这篇博客

+ 还没开始看龙书（以及其他相关领域的书），准备先写下现在的思路，等看了这些书以后再来回顾对照

## 为什么我的眼里常含泪水

+ 因为 Markdown 钦定 Tab 为 8 空格
+ 我的代码变得根本不能看了

## 那么下面是正文

Lisp 讲道理已经帮你手写好了语法树了，整个 parse 的过程也很简单，无非就是 String.substring() 的边界问题有点坑。
我目前的语法设计有这么几个规则：

+ 每个非空`()`都是一个函数调用，空`()`是 null 的字面量。
+ `(a b c)`是一个函数调用，翻译成 C 风格就是`a(b, c)`。
+ `true` `false` `null` 都是字面量
+ 数字都是字面量，支持 C 风格的 16 进制 8 进制和 2 进制。

可以先写字符串语法树：

```kotlin
interface StringNode {
  val strRepr: String
  val lineNumber: Int
}

class StringMiddleNode(
    override val lineNumber: Int,
    val list: MutableList<StringNode> = mutableListOf<StringNode>()) : StringNode {

  val empty: Boolean
    get() = list.isEmpty()

  override val strRepr: String
    get() = list.fold(StringBuilder("{")) { sb, last ->
      sb.append(" [").append(last.strRepr).append("]")
    }.append(" }").toString()

  fun add(n: StringNode) {
    list.add(n)
  }
}

class StringLeafNode(
    override val lineNumber: Int,
    val str: String) : StringNode {
  override val strRepr = str
}

class EmptyStringNode(
    override val lineNumber: Int) : StringNode {
  override val strRepr = ""
}
```

我们可以让 Parse 函数充满内部状态却做到引用透明：

于是有 Parser ：

```kotlin
var beginIndex = 0
val currentNodeStack = Stack<StringMiddleNode>()
currentNodeStack.push(StringMiddleNode(1))
var lineNumber = 1
fun check(index: Int) {
  // 检查一个 Token 是否合法，然后加入 TokenList。
}
code.forEachIndexed { index, c ->
  when (c) {
    ';' -> // 处理注释
    '(' -> // 括号
    ')' -> // 反括号
    ' ', '\n', '\t', '\r' -> // 解析分隔符
    // \n 记得处理注释
    '\"' -> // 解析字符串
    else -> {
      if (!quoteStarted) elementStarted = true
    }
  }
  lastElement = c
}
check(code.length - 1)
if (currentNodeStack.size > 1) {
  // 括号不匹配
}
return currentNodeStack.peek()
```

我为了解决这个问题，先把代码 parse 成一颗字符串组成的树，然后再进行 int string 等字面量的读取，然后再解析函数。

运行的时候就递归遍历运行即可。我们先对每个字符串进行解析：

```kotlin
fun parseValue(str: String): Node = when {
  str.isEmpty() || str.isBlank() -> EmptyNode
  str.isString() -> ValueNode(Value(str
    .substring(1, str.length - 1)
    .apply {
      // TODO replace \n, \t, etc.
    }))
  str.isOctInt() -> ValueNode(str.toOctInt())
  str.isInt() -> ValueNode(str.toInt())
  str.isHexInt() -> ValueNode(str.toHexInt())
  str.isBinInt() -> ValueNode(str.toBinInt())
  "null" == str -> ValueNode(Nullptr)
  "true" == str -> ValueNode(true)
  "false" == str -> ValueNode(false)
// TODO() is float
// TODO() is double
// TODO() is type
  else -> {
    serr("error token: $str")
    EmptyNode // do nothing
  }
}
```

然后再对这棵树进行遍历，并将它们做成 ValueNode/ExpressionNode 组成的一棵树：

```kotlin
fun mapAst(
    node: StringNode,
    symbolList: SymbolList = SymbolList()): Node = when (node) {
  is StringMiddleNode -> {
    val str = node.list[0].strRepr
    ExpressionNode(
        symbolList,
        symbolList.getFunctionId(str) ?: undefinedFunction(str),
        node.list.subList(1, node.list.size).map { strNode ->
          mapAst(node = strNode, symbolList = symbolList)
        }
    )
  }
  is StringLeafNode ->
    parseValue(str = node.str)
  else -> // empty
    EmptyNode
}
```

然后对它的 root 节点进行 eval() 即可。

## 关于函数、符号表

我一开始想的是符号表里面的函数做成 `Map<String, List<Value> -> Value>` 的形式。
后来发现，这样是即时求值的。也就是说，如果我需要实现 if ，它在拿到 Value 时实际上已经是 Node 的 eval() 结果了。 if 和 else 分支两个都会被求值，只是返回其中一个而已。

也就是说

```lisp
(if (> a b)
    (print "Van")
    (print "Darkholm")
)
```

这东西，无论 a b 大小关系如何， Van 和 Darkholm 这俩字符串都会被输出，区别只是 if 语句的返回值。

而 while 就更悲剧了， condition 和 expression 都只会求值一次，那么根本就没有循环。。。

在这个时候循环就只能靠 `eval 自己` 了。。。

于是我就只能进行了[一次大重构](https://github.com/ice1000/lice/commit/bf96ca6c9fe1ad771e4648a33a0785f2be414a41)，把所有 Value 改成 Node ，在需要用到的时候求值。

然后就可以正常实现 while 循环了。

差不多就是这样，然后我给搞了一套文件/URL 的 API ，让这连函数都不能定义的辣鸡有了点用途。

比如爬取 Vijos 的题目（方便起见，这里只爬取 1000 到 1500 号）：

```lisp
(for-each "i"
          (.. 1000 1500)
          (write-file (file (format "%d.html" (<- "i")))
                      (read-url (url (str-con "https://vijos.org/p/" (to-str (<- "i")))))
          )
)
```

在 repl 里面输入以上代码，可以看到文件树里面出现了大量奇怪的 html ，打开可以看到题目。

repl 可以在[这里](https://github.com/ice1000/lice/releases/tag/v1.0-SNAPSHOT)下载。

运行需要 jre 。

