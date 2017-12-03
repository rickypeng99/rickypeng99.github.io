---
layout: post
title: 关于字典树（ Trie 树）的一些想法（含 JNI 内容）
category: JNI
tags: Java, dataStructure
keywords: Java,JNI,C++
description: make trie a map
---

字典树是一种众所周知的很简单的数据结构，它把字符串的每一个字符作为节点，多个字符串合并相同的部分，
就成了一颗字典树，可以实现 O\(字符串长度\)的存取，还是很快的，道理我们都懂。

字典树的缺点是空间占用很高，但也不能说它空间复杂度大，因为在数据非常非常非常多的情况下，
它占用的内存往往和数据非常少的情况差不了多少。

好字典树介绍完毕，那么我这个大蒟蒻又能有什么想法呢？

## 本篇博客内容简介

+ 关于我自己脑补出字典树的心路历程
+ 字典树做成 Map
+ JNI 的一个坑

## 之前的故事

我曾经自己脑补出过这个数据结构，算是我一个时常提起的一个令我感到很自豪的事情——当时我在思考如何实现一个存储系统，
它能高效地存取大量字符串，然后就想到了这个方法。不过当时我想出来的和 OI/ACM 里面使用的字典树有些不同。

### 解决的问题

我需要一个`Map<String, String>`，但是使用`List<Pair<String, String>>`来存的话，查询的速度太慢了。

当时我才刚接触编程，非常天真无邪，都不晓得有`HashMap<String, String>`这样的东西。

当时我觉得，查询的时间和字符串的数量成正比，这不清真。如果是 Map 的话，写在内存里面，不能持久化存储（写入文件），
如果写入了文件，每次打开软件都得重新读写一次，不高兴。

假设我要弄个辞典 App ，我就需要把整个辞典存进文件，取的时候只取单个单词的数据，存的时候也只写一个，
我不要遍历。

### 解决方案.sln

我的想法是，拿到一个字符串 str ，然后把它的每两个字符之间插一个文件目录分隔符，最后插一个文件名（以下为伪代码）：

```kotlin
fun String.toTriePath() = this
    .split("")
    .fold(StringBuilder(".")) { sb, c ->
      sb.append(File.seperator).append(c)
    }
    .append(".txt")
    .toString()
```

然后我们就获得了一个路径，比如我们有`str = "ice1000"`，那么就得到了`./i/c/e/1/0/0/0.txt`这个路径。

然后我们创建这么一个目录，把这个字符串所携带的信息扔进去，比如：

```kotlin
File("ice1000".toTriePath())
    .openOrCreate()
    .writeText("Naive JVM Developer, blog: http://ice1000.org")
```

然后塞很多很多这样的字符串进去。然后我们就整出了一个巨复杂的文件树，根节点就是空字符串，每个文件（就是文件树的叶子节点）代表一个字符串。

最后我们需要查询的时候，把需要查询的字符串进行相同的处理，如果那个位置有文件，就取信息，否则就是不存在的键。

后来我想到这个方法可以扩展一下，凡是可以序列化的数据都可以成为这个字典树的值（键值对的值），于是他就变成了`Map<String, Serializable`。

这就可以解决很多问题了。

## 后来

后来，在 NOIP 2016 前夜（ OIer 看到这不准膜，我这方面很菜的），我为了复习数据结构与算法，顺便玩，把当时所学的东西写成
[一个库](https://github.com/ice1000/algo4j)。当时倒是没写多少，只是写了树状数组和不带启发式合并（只是没写，后来加上了）
的并查集（你看，我菜吧），后来加了各种东西，各种鬼畜，还上了四个 CI。

其中就包括这个字典树，它的内存结构绕开了 JVM 的 GC。

字典树本身的实现可以参考[我的这篇知乎回答](https://www.zhihu.com/question/58773391/answer/159554579)。
里面的代码是过时的（我改了 API 了），但是思路是不会变的。

我当时设计了这样的 API 并实现：

```kotlin
fun insert(String): Unit            // 插入一个字符串
fun contains(String): Boolean       // 是否已插入这个字符串
fun remove(String): Unit            // 移除一个字符串
fun containsPrefix(String): Boolean // 这个字符串是否是一个已经插入的字符串的前缀
```

最后一个可能有点绕，举个例子你们就知道啥意思了。

```kotlin
val trie = Trie()
trie.insert("ice1000") // 插入一个 ice10000
trie.contains("ice1000") // true
trie.contains("ice") // false
trie.containsPrefix("ice") // true, ice 是 ice1000 （已经存在的字符串）的前缀
trie.remove("ice1000") // 删除
trie.contains("ice1000") // false
```

很简单吧。

我把字典树的末端整成一个 boolean ，这样如果你有，就是 true ，没有，就是 false ，可以区分`contains`和`containsPrefix`。

## 将字典树实现为一个`Map<String, T>`

### 构想

原本我有一颗字典树，你可以放字符串进去。然后可以判断是否存在前缀，是否存在完全匹配的字符串。
但是后来我仔细一想，字典树明明可以实现为一个`Map`的，仅仅是拿来字符串存储/字符串排序其实很浪费资源。

而且操作也很简单，把最后那个`boolean`改成`jobject`就好了。

### 操作

把`insert`加上一个参数，就是要放进去的`Object`。

然后`contains`改成`get`，返回的不是`Boolean`而是那个`Object`。

### 被坑

于是我就把那个`boolean`改成了`jobject`，然后发现无论我怎么`insert`，然后再`get`，它返回的都被`JVM`当成`null`。

然后我幡然醒悟，`JNI`传进去的该不会只是个局部指针吧。。。。 QAQ

因此我应该把这个指针全局化。

讲这方面的博客很多（就是那种你一搜可以搜到几十个答案，但是去重之后只有两三篇那种），
[这个博客](http://landerlyoung.github.io/blog/2014/10/16/java-zhong-jnide-shi-yong/)
的 UI 比较舒服，你们可以去看这个。不过我在上面获得的信息就一个，就是咋整全局引用。

其实就是调用一下`env->NewGlobalRef(jobject _obj)`就好了，被这样处理的对象会被`JVM`的`GC`无视掉，
等你下次调用`env->DeleteGlobalRef(jobject _obj)`的时候它会重新回到`GC`中。

```cpp
JNIEXPORT auto JNICALL Java_org_algo4j_tree_Trie_set(
    JNIEnv *env,
    jobject,
    jlong ptr,
    jbyteArray _word,
    jobject _obj) -> void {
  __JNI__FUNCTION__INIT__
  auto trie = (Trie *) ptr;
  __get(Byte, word);
  auto obj = env->NewGlobalRef(_obj);
  trie->put(word, __len(word), obj);
  __abort(Byte, word);
  __JNI__FUNCTION__CLEAN__
}

JNIEXPORT auto JNICALL Java_org_algo4j_tree_Trie_remove(
    JNIEnv *env,
    jobject,
    jlong ptr,
    jbyteArray _word) -> void {
  __JNI__FUNCTION__INIT__
  auto trie = (Trie *) ptr;
  __get(Byte, word);
  auto ref = trie->remove(word, __len(word));
  env->DeleteGlobalRef(ref);
  __abort(Byte, word);
  __JNI__FUNCTION__CLEAN__
}
```

由于一些特殊的原因，`JNI`函数我都写的很傻（就是没有那种表达式嵌套表达式的，中间量我基本都拿了局部变量保存）。

后来我还加入了指针的安全访问的问题，可以随意`clear`不会 GG ，而且有正确的行为了。

# **[求 star](https://github.com/ice1000/algo4j/)**
