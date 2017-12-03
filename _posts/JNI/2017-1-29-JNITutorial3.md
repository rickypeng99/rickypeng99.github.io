---
layout: post
title: JNI 开发：第三章 基本类型数组操作
category: JNI
tags: Java
keywords: Java,JNI,C++
description: JNI Tutorial
---

## 为什么要学习基本操作

+ 不学你用个 P 啊

## 为什么本篇博客到最后才规定代码规范

+ 因为你现在还不知道为什么需要规定，根据什么规定，看到最后才知道

## 依赖

+ 上两篇教程任意一篇看完之后搭建好的环境

## 准备工作

看前两篇教程任意一篇即可。

## 先想个你要写的东西

比如求最大公约数吧。

## 然后开始写

先写好 Java 接口，我们全程使用 javah 的帮助来生成头文件。这篇博客我们重新搞个 Java 工程，前两篇的不需要了。既然读者都来看 JNI 了，~~想必是高度熟悉 Java 了，~~所以就不再讲解一些关于 Java 的东西啦。

```java
package jni;

public class MathUtils {
  public static native int gcd(int a, int b);
}
```

然后编译， javah 获取头文件。现在我们的工作目录应该有这些文件：

```yml
root:
  - src
    - jni
      - MathUtils.java
  - out
    - jni_MathUtils.h
    - jni
      - MathUtils.class
```

然后编写对应的实现文件。前面已经说过 JVM 的各个值类型到原生代码中的类型映射了，你们应该都知道 JVM 的 int 对应的是 jint 。所以这么写就好：

```c
JNIEXPORT auto JNICALL Java_jni_MathUtils_gcd(
    JNIEnv *env,
    jclass,
    jint a,
    jint b
) -> jint {
  jint c;
  for (; m > 0; c = n % m, n = m, m = c);
  return n;
}
```

然后编译，像教程一里面那样运行。我觉得应该不会有啥问题，这个 native 返回的是 a 和 b 的最大公约数。

然后我们来看看更复杂的 JNI 方法。不知道你们注意过么有，每个 JNI 方法都有一个 JNIEnv \* 类型的谜之指针，接下来告诉你们这个东西是干啥用的。

我们再写一个方法：

```java
public static native int findMax(int[] origin);
```

然后 javah 生成一个头文件。你会看到这样的签名。

```cpp
JNIEXPORT jint JNICALL Java_jni_MathUtils_findMax(
    JNIEnv *,
    jclass,
    jintArray
);
```

你看了下啥是 jintArray ，发现就是一个空结构体，继承自 jarray ，现在的你一脸懵逼。你是不是以为会传进来一个 jint 的数组？

Naive 。

**实际上，这个传进来的破玩意只是一个指向 JVM 里那块数组对应的内存的指针，类似 ID 一样的存在，你可以通过它获取数组的元素、设置数组的元素、获取数组的长度，但它本身和数组无关。**也就是说，光有这个指针，是啥都干不了的。

所以我们需要用到那个 JNIEnv 指针，用它获取那个数组，并对 JVM 中对应的数组的元素进行赋值。

顾名思义，这个 JNIEnv 就是 JNI Environment ， JNI 环境。

```cpp
JNIEXPORT jint JNICALL Java_jni_MathUtils_XXXX(
    JNIEnv *env,
    jclass,
    jintArray _data) {
  jboolean option = nullptr;
  jint *data = env->GetIntArrayElements(_data, option);
  // 现在 data 就是那个数组的拷贝啦。以后会讲如何直接获取数组本身。
  jsize len = env->GetArrayLength(_data);
  // 获取数组长度
  data[0] = -1;
  // 举个例子
  env->ReleaseIntArrayRegion(_data, data, JNI_OK);
  // 上面这句把 data 被操作之后的值赋回去。
  // JNI_OK 表示把 data 复制到 JVM 去，并释放 data 这个数组。
  // 还有两个可以传进去的值：
  // JNI_COMMIT 表示复制，但不释放。
  // JNI_ABORT 不复制，但释放资源。
}
```

注意看注释，我觉得我写的很清晰。然后正确的实现就应该是这样的：

```cpp
JNIEXPORT jint JNICALL Java_jni_MathUtils_findMax(
    JNIEnv *env,
    jclass,
    jintArray _data) {
  jboolean option = nullptr;
  jint *data = env->GetIntArrayElements(_data, option);
  jsize len = env->GetArrayLength(_data);
  jint ret = data[0];
  for (auto _ = 1; _ < len; ++_) {
    if (data[_] > ret) ret = data[_];
  }
  env->ReleaseIntArrayRegion(_data, data, JNI_ABORT);
  return ret;
}
```

因为不需要把数组复制回去，于是我们使用 JNI_ABORT 。然后只需要简单地返回 ret 就好了。对同一个数组请不要多次 release ，不要手动 delete 。

这样就是基本的稍微复杂的数据操作了。获取数组长度都可以通过 GetArrayLength 这个方法来完成，获取数组元素都可以用 Get\<Type\>ArrayElements 获取。

如果你需要在 JNI 端创建一个数组，那么使用如下方法：

```cpp
env->NewIntArray
env->NewLongArray
env->NewCharArray
env->NewByteArray
env->NewShortArray
env->NewFloatArray
env->NewDoubleArray
```

比如：

```cpp
auto arr = env->NewIntArray(233);
```

当然，如果是这样的数组，你就不能简单地 release 了。如果你需要更新数组的值，你需要使用这个方法：

```cpp
// data 是 jint *
// _data 是 jintArray
env->SetIntArrayRegion(_data, 0, len, data);
```

在 set 完之后，是**不能** release 的。此处应该使用

```cpp
delete data;
```

来回收内存。

## 然后我们规定一下代码规范吧

首先，上面为了让一些 C++ 水平较低的读者习惯，我没有使用太多的比较不常见的 C++ 写法。以后我会：

+ 变量尽可能使用自动类型推导
+ 函数声明尽可能类型后置
+ 重复代码使用宏

:---|---:
风格|使用场合
_camelName|JNI 数组在 JVM 中的指针（就是传进来的东西
camelName|JNI 数据本身的指针（就是 GetIntArrayElements 得到的

以上的 camelName 表示这是一个驼峰命名法的东西。比如上面的代码中的命名：

```cpp
JNIEXPORT auto JNICALL Java_XXX_xxXx(...., jintArray _data, ...) -> jint {
  auto data = env->GetIntArrayElements(_data, NULL);
  auto _newArray = env->NewIntArray(233);
  auto newArray = new jint[233]();
  // codes
  env->SetIntArrayRegion(_newArray, 0, 233, newArray);
}
```

这次只讲了极少的东西，下次稍微信息量大点哈。

## 你学到了什么

+ JNI 数组基本操作
