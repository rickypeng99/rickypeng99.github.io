---
layout: post
title: 用 CMake 开发 JNI ：第二章 第二个环境搭建
category: JNI
tags: Java
keywords: Java,JNI,C++
description: JNI Tutorial
---

这篇也发蛤乎了，[链接在此](https://zhuanlan.zhihu.com/p/25063917)。

## 为什么要用 CMake / CLion

+ 上篇博客清清楚楚地写着 Dev Cpp 是辣鸡
+ CLion 和 Visual Studio 都钦定 CMake

## 依赖

+ 64 位电脑
+ CLion
+ MinGW
+ JDK

## 准备工作

首先安装 JDK 和 CLion ，并将`[jdk path]/bin/`这个目录添加到环境变量。注意，这个目录下有很多重要的可执行文件，比如 javac javap javah 等。等会我们就需要用到 javah 。

然后 JDK 安装目录下有一个叫 include 的目录，里面有几个 C++ 头文件，这个 include 目录还有一个子目录，似乎叫 win32 。
现在把这些文件全部复制出来，放到一个地方。注意，把 include/win32 目录和 include 目录下的文件拷进 MinGW 的 include 目录。

写到这里我突然发现，这篇博客绝大多数内容都和上篇一样，所以我只写 CLion 操作和 CMake 配置的部分 = =

首先你需要阅读上一篇博客，直到你把那个 javah 生成的头文件搞出来。现在打开 CLion ，创建一个新工程。注意选好 MinGW 的路径。如果你已经安装 Dev Cpp ，你可以直接使用 Dev Cpp 自带的路径。创建好工程好，检查你现在的工作目录，是否和下面写的一样。

```yml
root
  - .idea
  - main.cpp
  - CMakeLists.txt
```

现在删除 main.cpp ，并将前一篇教程中给出的两个 C++ 代码文件（一个 .cpp ，一个 .h ）放入当前工作目录。然后编辑 CMakeLists.txt 文件：

```cmake
cmake_minimum_required(VERSION 3.6)
project(jni)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")

set(BUILD_USE_64BITS on)

set(
    SOURCE_TEMPLATES
)

set(
    SOURCE_FILES
    WinAPI.cpp
)

set(
    SOURCE_HEADERS
    WinAPI.h
)

# add_executable(jni ${SOURCE_FILES})
add_library(
    jni
    SHARED
    ${SOURCE_FILES}
    ${SOURCE_TEMPLATES}
    ${SOURCE_HEADERS}
)

target_link_libraries(jni)
```

然后 <kbd>Ctrl</kbd>+<kbd>F9</kbd> 编译，编译后你的目录应该是这样：

```yml
root
  - .idea
  - WinAPI.cpp
  - WinAPI.h
  - CMakeLists.txt
  - cmake-build-debug
    - libjni.dll
    - 还有一大堆鬼迷日眼的东西
```

就这么简单，把 libjni.dll 拷出来，重命名为 jni.dll ，剩下的又和上一篇教程同步了。

祝你愉快。 JNI 的实际使用还可以参照我的算法库，这是一个活生生的例子 DAZE ，请点击[GitHub 传送门](https://github.com/ice1000/algo4j)。喜欢的话给个 star 哟。

## 你学到了什么

+ JNI 开发环境搭建
+ CLion 配置
