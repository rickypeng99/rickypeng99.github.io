---
layout: post
title: 初次见面， Flutter ！（一个月试用报告）
category: Flutter
tags: Flutter
keywords: Dart,Flutter,Fuchsia
description: Greetings, Flutter!
---

大家好，这是我首次发表关于 Fuchsia 系统开发的相关文章，也是我承诺已久的使用报告。

## 首先

是 Flutter Fuchsia 和 Dart 的关系。

0. Fuchsia 是股沟的新操作系统，极有可能被突然甩掉不要
0. Flutter 是 Fuchsia 的开发框架，支持导出 Android iOS 和 Fuchsia 三个平台的安装包
0. Dart 是为以上两者服务的官方编程语言

## 关于 Dart

语言本身我就不作评价了，我自己的看法是，就拿 Kotlin 来说， Dart 和 Kotlin 的对我的开发流程和思维的影响的区别，
相当于 Eclipse 和 IntelliJ IDEA 的区别。你们自己体会吧。

在这里我拿 Dart 和全民的大众语言 Kotlin （想必大家都会了，这两天可是如火如荼呐）作一个对比。

### 如何从 Kotlin 转向 Dart

0. 记住， Dart 没有空安全，不要以为不加问号的地方就一定不是 null
0. 凡是你没有初始化的地方全是 null ！

其他基本就是意念编程了。这门语言没什么难点，也没什么黑点，特性是比较少，但是我觉得这并不影响我使用。

毕竟 Java 都忍的了（在 Java 和 Dart 之间，我站 Java ，但是我客观觉得 Dart 更好）。

### Dart 的平台问题

Dart 的编译有两个解决方案：

0. 编译到 JavaScript ，这就和 Kotlin 和 TypeScript 一样了。
0. 编译为字节码放在虚拟机上运行

这其实说白了就是一个 Kotlin ，只不过语言本身比较挫，而且它的虚拟机不是 JVM 。这其实有个好处，就是可以黑魔法优化，
不需要管标准啊规范什么的，虚拟机也不需要考虑向后兼容，没有 JVM 那种负担。

## 关于环境搭建

是让你下载源码自行构建的，虽然会被网速狠狠地坑一波，但是我目前在三台电脑两个不同的操作系统（ Windows10 ，
Deepin Linux 15.4 ）上分别构建过，均没有遇到问题。

我感觉还是挺靠谱的。目前我使用这个工具进行 Android 开发，大概需要经历：

0. clone
0. 编译它
0. 它自己下载最新 Dart SDK
0. 寻找 AndroidSDK 及相关工具
0. 寻找 Android Studio/IntelliJ IDEA 及他们各自是否已经安装 Flutter 插件
0. 寻找连接的 Android 设备

这其实就是：

```batch
flutter doctor
```

## 最后说说感受

原本我是打算写完一个 Demo 再写此文的，不过我现在可能做不到了。 Demo 还没写完，最近编程时间确实很少。

然后的计划是，分享一些造过的轮子。因为现在 Fuchsia 社区很不成熟嘛，我作为早期开发者，自然是承担着踩坑和造轮子的责任的。

在撸这个小玩具的时候造了好多好多轮子啊，我把他们都一一封装了（其实都是小东西，只是官方没有，我就去啃他们 UI
框架源码然后照着写，结果还行，挺好用的）。以后都会有分享的啦。

最近在 CodeWars 上练 Haskell ，[于是 Demo 就做的是 CodeWars 客户端呢](https://github.com/ice1000/code_wars_android)\~

而且我还研究出了怎么把 Fuchsia 应用部署到 Travis CI 上，以后可能会有系列教程。

今天心情烦躁不想写代码，写完这文就睡觉。
