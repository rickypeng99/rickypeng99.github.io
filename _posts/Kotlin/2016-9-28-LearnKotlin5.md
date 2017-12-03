---
layout: post
title: 如何让孩子爱上 Kotlin ： DSL （上）
category: Kotlin
tags: Essay
keywords: Kotlin
description: Kotlin DSL 1 extension
---

## Kotlin 传教文

本文向您介绍 Kotlin 语言的一些奇特之处，方便您对 Kotlin 这门语言建立一个简单的概念。

很久没发文章了，我觉得应该勤奋一点。。。嚯呀。。

## 我搞了个大新闻

既然 Kotlin 是门强大的语言，看看 anko 就知道它有多厉害了。于是我也基于 Kotlin 的 extension 给 FriceEngine 写了个 DSL 系统。先看看它长啥样吧：

创建游戏窗口：

```kotlin
game {
}
```

设置宽为 80 ，添加一个椭圆并设置一些属性：

```kotlin
game {
  bounds {
    width = 800
  }
  oval {
    x = 20.0
    width = 120.0
    color = BLUE
  }
}
```

多么简单的写游戏方法啊，这就创建了一个 FriceEngine 的游戏窗口，添加物体的代码看起来也是那么友善。类似的 API 还有 rectangle、button、text 等，用于向画面添加元素。

用过 anko 开发 Android 的朋友们应该都见过上面那种写法吧。那么原理是什么呢？这就涉及 Kotlin 的高级姿势——extension 啦。建议阅读本文之前，先对前文中所描述的这个引擎有个基本概念，方便理解引擎的工作流程。

## extension 是啥

在 Kotlin 中，有一种神奇的黑科技语法，它为 Kotlin 构造 DSL 和 Gradle 做成了最主要的贡献。

在 Kotlin 的标准库中，也是大量采用这种语法为现有的 Java 标准库进行扩展（尤其是集合框架）。如下所示。

```kotlin
infix fun Range.step(step: Int): Range {
  // codes
}
```

这段代码定义了一个方法，这个方法属于 `Range` 类，参数是一个 `Int`。`infix` 表示该方法可以写成中缀表达式的形式。调用的话就能这样调用了：

```kotlin
(0..width step 2).forEach { i ->
}
```

这个给类添加方法的语言特性看起来神奇到爆，就像 Ruby 的打开类一样。这是在元编程吗？显然不是的， JVM 字节码不可能干这种事，又不是 Groovy。
这种写法可比 Groovy 的 Gradle 简单啊。

因此我作为一个追求真理的人，写了一段 extension 之后自行逆向字节码+使用 Java 成功调用，发现并证实了其中的奥秘。这段代码被编译到 JVM 后变成了这样：

```java
public Range step(Range $reciever, int step) {
  // codes
}
```

原来如此！调用者成为了一个参数。这也是 extension 不能用于 Kotlin 库文件作用域之外的原因，因为它其实只是个普通的方法。

通过这个原理我封装了我的 Android 的读取 URL 资源的工具方法：

```kotlin
fun String.webResource(submit: (String) -> Unit, default: String = DEFAULT_VALUE) {
  async() {
    var ret = readString(default)
    uiThread { submit(ret) }
//    Log.i("important", "ret = $ret")
    Log.i(this@BaseActivity.toString(), this@webResource)
    if (!ret.equals(DEFAULT_VALUE) && !haveNetwork) {
      uiThread { submit(ret) }
    } else {
      ret = java.net.URL(this@webResource).readText(Charsets.UTF_8)
      uiThread { submit(ret) }
      save(ret)
    }
  }
}
```

然后要获取网络资源的话，直接使用"https://github.com/icela".webResource { s -> textView_main.text = s }就能获取网络资源了。这种写法显然高大上多了。

于是就有了这样的代码：

```kotlin
// 声明
fun Int.elapsed(): Boolean {
}

// 调用
if (1000.elapsed()) {
  /* codes */
}
```

嗯，差不多就是这样。而且由于方法是扩展方法，方法内部的上下文是被扩展的类。什么意思呢？考虑如上代码。在 `elapsed` 函数内部使用 `this` ，得到的是 `Int` ，而不是 `Game`。
因此，扩展方法是可以修改局部上下文的。这为 DSL 的构建提供了方便。

下次讲代码块、`inline`、`crossinline`、`noinline`。预计三篇能把 Kotlin 这特性说完。

嘛，就这样啦。欢迎围观 Frice 全家桶：

+ [Frice-JVM](https://github.com/icela/FriceEngine)
+ [Frice-CLR](https://github.com/icela/FriceEngine-CSharp)
+ [Frice-Designer](https://github.com/icela/FriceDesigner)
+ [Frice-Demo](https://github.com/icela/FriceDemo)
+ [Frice-DSL](https://github.com/icela/FriceEngine-DSL)


，求 star 求 follow ！ QwQ
