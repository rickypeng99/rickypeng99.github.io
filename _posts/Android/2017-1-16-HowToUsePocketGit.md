---
layout: post
title:  Android 神器 Pocket Git 的使用
category: Android
tags: Android
keywords: Git
description: How to use Pocket Git
---

## 依赖

+ [Android app Pocket Git](http://www.coolapk.com/apk/com.aor.pocketgit)
+ 一部 Android 手机

上面已经给出酷市场下载地址。

## 为什么需要它

首先我们学生党啊，是经常拿不到电脑的。
但是我们又不希望 GitHub commit 断掉，那么怎么办呢？

来看看这个 Android 的 Git 客户端吧。事先声明，我根本不认识作者，这是推荐良心作品！

安装后应该是这个样子：

（抱歉，图片不见了，以(lao)后(zi)有(lan)空(de)补）

先点右上角，设置你的用户名和邮箱：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/img/Screenshot_2017-01-16-19-16-42-05.png)

然后我们来 clone 一个项目。点击右下角粉色 fab ，填写 URL ，目录，以及你的用户名，密码：

![](https://coding.net/u/ice1000/p/Images/git/raw/master/img/Screenshot_2017-01-16-19-17-04-73.png)

然后你的项目创建好了。点击它，然后 clone:

![](https://coding.net/u/ice1000/p/Images/git/raw/master/img/Screenshot_2017-01-16-19-43-07-60.png)

然后等待一会。任务栏会有 counting objects 的进度。好了之后，点开 Pocket Git ，可以看到仓库了：

（图片再次神(wang)秘(ji)失(jie)踪(le)）

随便修改一个文件，然后你会发现它右边的图标变成了蓝色问号。长按它，然后进入多项选择模式，

![](https://coding.net/u/ice1000/p/Images/git/raw/master/img/Screenshot_2017-01-16-19-43-32-77.png)

右上角有个大拇指，点它 stage。然后此时右下角出现一个粉色 fab ，点击填写 commit 信息。注意，此时点击这个 dialog 中的那些文件，可以看到 diff 界面，非常友好。这个功能我就不截图了，你们自己用手机感受。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/img/Screenshot_2017-01-16-19-43-47-27.png)

然后右上角云符号☁，点击 push。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/img/Screenshot_2017-01-16-19-43-52-04.png)

这是最基本操作，详细的可以看它的 Help ，挺详细的不过是英语。以后可能会出个高阶教程，把我目前对它的一些操作给详细地写一写。
