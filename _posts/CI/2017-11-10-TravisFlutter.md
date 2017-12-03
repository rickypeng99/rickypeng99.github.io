---
layout: post
title: 将 Flutter 项目部署到 Travis CI
category: CI
tags: CI, Flutter
keywords: CI, Flutter
description: Building Flutter on Travis
---

Travis CI 是一个难用又好用的 CI ，由于本身支持的东西就少，今天我们来尝试将 Flutter 部署到它上面。

这个是我曾经自己琢磨出来的，现在发出来。

就不讲 iOS 的编译了，就只讲 apk 。

Flutter 这种还在 alpha 的垃圾是没有二进制分发的版本的，因此我们只能卑躬屈膝地编译它。
先编译工具链再编译自己的项目对于小众技术的 CI 部署是司空见惯的事情。

## 几个常见的误区

> 我把编译出来的东西 cache 了，会变快

cache 的东西会在每次 build 的时候下载进你的沙盒，这个下载的过程普遍慢于下载源码后本地编译；
而且 Travis 为那么多项目服务，你的良心不会痛吗

> 不会

滚

> 我能把 artifact 提取出来，并发送到 GitHub release

曾经可以，现在 GitHub 把这个 API 关了

> CI 没有用

这对于帮助那些对你的项目有兴趣的人构建你的项目有着极其有效的参考价值，有时还能作为发布文档之类的工具，
还能防止垃圾 pull request ，何乐而不为。

## 任务

+ 下载源码并编译 flutter 本身
+ 安装 Android 组件
+ 手动安装 Gradle ，避免 Wrapper 搞事
+ 配置各种环境变量
+ 编译我们的项目，并生成 apk

## 初始化

首先，我们指定语言为 `android` ：

```yaml
sudo: required
language: android
os:
  - linux
```

## 安装 Android 组件

然后加上一大坨 Android 的依赖：

```yaml
android:
  components:
    - tools
    - platform-tools
    - build-tools-25.0.3
    - android-25
    - extra-android-support
    - extra-google-google_play_services
    - extra-android-m2repository
    - extra-google-m2repository
    - addon-google_apis-google-21
#
```

然后我们现在就可以正常的部署一个 Android 项目了。

现在我们来安装 Flutter 。

## 下载 Gradle 的二进制文件和 Flutter 源码

首先，在 `before_install` 里面，我们 clone flutter 的 alpha 分支的源码；
然后再下载 Gradle 3.5 的二进制分发文件并解压它：

```yaml
before_install:
  - git clone -b alpha https://github.com/flutter/flutter.git
  - wget http://services.gradle.org/distributions/gradle-3.5-bin.zip
  - unzip gradle-3.5-bin.zip
#
```

## 配置环境变量

蓝后我们把上面那一大扒拉东西都加进环境变量：

```yaml
install:
  - export GRADLE_HOME=$PWD/gradle-3.5
  - export PATH=$GRADLE_HOME/bin:$PATH
  - export PATH=./flutter/bin:$PATH
#
```

为什么不需要执行 `flutter doctor` ？因为在编译的时候，
如果这个没有被第一次执行，那么它是会自动执行的。

## 编译

很简单，我们都知道了已经。先从 `aot` 编译它，再编译 `apk` ，然后编译 Fushcia 的安装文件 `flx` ：

```yaml
script:
  - flutter build aot
  - flutter build apk
  - flutter build flx
#
```

这就结束了。

如果 GitHub 没有关闭 release API ，我们还可以通过这种方式来自动上传 artifact
（例子里上传了 `apk` 和 `flx`）到 release 里：

```yaml
deploy:
  provider: releases
  skip_cleanup: true
  api_key:
    secure: [自己查 Travis 文档，这个怎么拿]
  file:
    - build/app/outputs/apk/app-release.apk
    - build/app.flx
  on:
    tags: true
    repo: [GitHub 用户名]/[仓库名]
```

上面有三个信息是你需要自己填进去的。

## 结束

是的，我说完了。

## 你学到了什么

你什么也没学到。

## 参考项目

+ [ice1000/code\_wars\_android](https://github.com/ice1000/code_wars_android)
