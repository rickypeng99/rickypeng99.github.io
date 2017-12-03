---
layout: post
title: 谷歌黑科技：为什么这么小啊
category: Android
tags: Android, png, image, webp
keywords: Android, image, png, webp
description: Why is this so f#cking small ?!
---

我今天算是被震撼了，本来 OI 考试我[第一题超级水题输出忘了换行，导致全爆](https://github.com/ice1000/OI-codes/blob/master/else/2016-7-11-game.cpp)，非常尴尬的心情完全因为认识了下面这个东西而消失不见啦。

这是谷歌出品的一个黑科技，主要作用是图片压缩，目前在 apk 瘦身中广为运用。

它的名字叫，**Webp**。

## 依赖

+ Webp 命令行工具

别害怕，看完博客让你摆脱对命令行的恐惧（当然，如果你本来就喜欢命令行的话更好 ^_^

## 安装与部署

+ 打开[官网](https://developers.google.com/speed/webp/)自己找链接（需要科学上网）
+ 下载之后将解压后的 bin 目录添加到环境变量。如果你不知道我在说什么，你可以继续看下去没关系，教程中的操作是不需要配置环境变量的（除了最后的实验我自己要用），不过还是推荐读者事先了解如何配置环境变量，操作和配置 git 的方法相同，你可以按照配置 git 的方法来做。
+ 复制一张 png 图片到 bin 目录下
+ 打开终端，进入到 bin 目录

现在你应该是这个状态。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/andr/webp/2.png)

另外，我把我的桌面用于演示了。这是我的桌面图片原图，大小你可以在上面的截图看到， 1.3MB ，比较可怕。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/andr/webp/1.png)

现在我们要压缩它。

打开终端的话， win10 用户可以这样打开。别的你只能自助了。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/andr/webp/3.png)

## 使用

执行以下命令：

```c
cwebp -q 100 [你的图片文件名] -o [你的图片文件名，扩展名改为 webp]
```

如果你不知道我在方括号里面写的是啥，可以把图片命名为 test.png ，然后试试和我一样的命令：

```c
cwebp -q 100 test.png -o test.webp
```

然后看着奇迹发生吧，这是命令行的截图：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/andr/webp/4.png)

再看看生成的图片的大小：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/andr/webp/5.png)

我非常一颗赛艇。这个图片格式是可以用于 Android 的，直接拖进去当成一个 png 用就行了。当然， chrome 也支持打开。

## 更好地使用

改变压缩率：

```c
cwebp -q [质量] [source.png] -o [target.webp]
```

将 webp 转化为 png ：

```c
dwebp [source.webp] -o [target.png]
```

后来我发现， Google Play 上的所有 App 相关的图片全部是 webp 格式的，我右键保存了几张图片，下载的时候就全是 webp。。不知道那些没听说过这个格式的人会不会以为人家是在加密啊。。

然后我就拿 dwebp 把图片给弄回去了。（幸好有了命令行工具啊，不然也只能看着一张张只有 Chrome 才能打开的图片发呆了（不过截图倒是一个 solution ，嘿嘿））

## 你学到了什么

+ apk 瘦身技巧
+ webp 命令行工具的安装与使用