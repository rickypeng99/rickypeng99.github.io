---
layout: post
title: 将 Haskell 翻译为 Rust Dart Java （上）标准库
category: Haskell
tags: Haskell
keywords: Haskell, Java, Dart, Rust
description: Translating Haskell into various languages
---

因为最近给魔理沙的两道 Haskell 题写了 Java Dart Rust 的翻译，感觉在这之中能提取不少通识性的东西。
同时这也让我意识到不少语言都有着可以在一定程度上模拟 Haskell 的能力，这其实对于从其他语言转到 Haskell
是有益的。

所以说现在加入魔理沙的后宫的方式可能又多了一种，就是去 [CodeWars](https://www.codewars.com/r/8-drmA)
做她出的题。。。先注册然后把 clan 改成 Gensokyo 就可以在 dashboard 看到组织了。
~~然后你会在 allies 排行榜中看到一个 1dan 的深海巨触~~

这个系列会有两篇文章，第一篇是标准库的一些对应实现，另一篇（预计）是关于范型啦，写测试啦等等。

第二篇还会有一些我自己写的时候学到的小技巧，顺便简要介绍一下我自己对这些语言的看法。

# 有哪些题目呢

+ [isomorphism](https://www.codewars.com/kata/isomorphism) 已支持 Haskell Java Dart Rust
+ [algebraic isomorphism](https://www.codewars.com/kata/algebraic-isomorphism) 已支持 Haskell Java Dart
+ [peano and church](https://www.codewars.com/kata/peano-and-church) 由于还没 approve 所以目前只有 Haskell

还有一些我自己也没做的。

# 有哪些通识性的东西呢

其实也就是在语言的选择上所需要注意的问题。

+ 在标准库没有这些东西的语言里补充对应的 `Tuple/Either/Maybe/Unit/Void` ，已经有的就不用再加了。
+ 大部分语言都已经有了 `Functor/Monad` 对应的方法(比如 `List` 的 `map/flatMap`)，没有的必须补充。
+ 在 Haskell 中过于常用的类型约束在其他语言里面一般是范型，因此这语言必须有范型。
+ 某些有**类 型 擦 除**的语言要尽可能避免类型擦除，除非推导不了了。
+ 没有了 Haskell 的推导能力会导致你需要手写大量类型签名，所以这其实是一件很辛苦的事情。
+ 自己添加的类型需要重载 `equals` 的那种需要进行作弊检查，避免别人把 `equals` 改成恒返回 `true` 。

Dart 和 Java 都不是一开始都有范型的，所以说功能偶尔会受限，不过这些都不是大问题~~，他们都比 Golang 牛逼~~。

# 库的实现

这里就直接搬出几个相关代码，由于万恶的 **billion dollar mistake** 的存在，很多语言都能玩一些 Haskell 里面不能玩的
null play ，这相当于作弊了，因此在进行设计的时候要考虑尽可能规避 null 使用的可能性。

## Java

Java 其实挺好，就是类型擦除弱鸡。第 8 个版本引入了 Lambda 的字面量，使得模拟这种东西变得非常友好。

不得不说 Java 这个 Lambda 语法设计的非常非常成功，我觉得比 Kotlin/Dart 都好。由于单个表达式可以省括号，
因此写一个柯里化过的函数就非常非常方便：

```java
return iso(ab -> a -> b -> ab(a, b));
```

对应的 Kotlin 就略显臃肿：

```kotlin
return iso { ab -> { a -> { b -> ab(a, b) } } }
```

Dart 也有点傻逼了，因为参数哪怕只有一个也得打括号：

```dart
return iso((ab) => (a) => (b) => ab(a, b));
```

反正都比 Java 长。

~~但这并不能掩盖这语言是菜鸡的事实~~

### Maybe

```java
import java.util.Optional;
```

### Either

```java
@SuppressWarnings("unchecked")
abstract static class Either<L, R> {
  public abstract <T> T pm(Function<L, T> lt, Function<R, T> rt);

   static <L, R> Either<L, R> left(L l) {
    return new Either<L, R>() {
      @Override
      public <T> T pm(Function<L, T> lt, Function<R, T> rt) {
        return lt.apply(l);
      }

      @Override
      public boolean equals(Object rhs) {
        return rhs instanceof Either<?, ?> && ((Either<?, ?>) rhs).pm(l::equals, rr -> false);
      }
    };
  }

  static <L, R> Either<L, R> right(R r) {
    return new Either<L, R>() {
      @Override
      public <T> T pm(Function<L, T> lt, Function<R, T> rt) {
        return rt.apply(r);
      }

      @Override
      public boolean equals(Object rhs) {
        return rhs instanceof Either<?, ?> && ((Either<?, ?>) rhs).pm(ll -> false, r::equals);
      }
    };
  }
}
```

这个实现避免了 null 的可能出现，因为没有多余的 field 的存在，任何变量都是有意义的。

使用两个 field （ `final L l; final R r` ）来表示 Either 的话，势必会存在一个 null 来占位，这样的做法就是丑陋的。
此处赞美莎莎。

但是由于 Java 的类型擦除，我们需要 `@SuppressWarnings("unchecked")` ，因为不能写 `rhs instanceof Either<L, R>` 。

### Tuple

```java
final static class Tuple<A, B> {
  A a;
  B b;

  Tuple(A a, B b) {
    this.a = a;
    this.b = b;
  }

  @Override
  public boolean equals(Object rhs) {
    Tuple<A, B> ab = (Tuple<A, B>) rhs;
    return a.equals(ab.a) && b.equals(ab.b);
  }
}
```

这个就贼普通了。

### Unit

```java
final static class Unit {
  public static Unit INSTANCE = new Unit();

  private Unit() { }
}
```

没什么可以说的， Kotlin 反正带了。

### Void

```java
interface Void {
  <T> T absurd();
}
```

标准库的那个 Void 要不得，因为它没有 absurd （对应 Haskell 的 `Data.Void.absurd`）。

写成 `interface` 的目的是懒得手写 `throw new UnsupportedOperationException` 。就是一个占位的东西。

因为 Void type 看作自然数就相当于 0 ，而 `0 * a = 0` ，这个 `absurd` 就是用来表示这个关系的。

## Dart

Dart 一般，就是 dynamic 类型使静态检查变得弱鸡，而且人家 Java 起码有个 Optional 和一个残废的 Void ，
这逼玩意啥都没有。

好处是语法比较现代，支持一些比如 property 啦，单行方法啥的语法糖，写起来还比较有味道。

**但！是！它！不！支！持！匿！名！内！部！类！**

**它！甚！至！不！支！持！类！中！类！**

综上，这东西应该算是今天登场的语言中最菜的那一个。语法好是好，类型系统烂了有什么用，现在网上那些跟风 Java
黑自己啥都不知道也就只能拿语法来说事，然而**恕我直言，只因为语法不舒服、糖少就说语言不好的人，都是垃圾**。

这就叫**黑没黑到点子上**。

下面这些都是我自己写的，我自我感觉良好 : \)

### Maybe

```dart
abstract class Optional<T> {
  static _None _none = new _None();
  static _Some<T> from<T> (T obj) => new _Some(obj);
  static _None empty() => _none;
  @override bool operator ==(other);
  Optional<T> map(Function f);
  Optional<T> fmap(Function f);
  T get();
  T orElseGet(Function f);
  bool isPresent();
}

class _Some<T> extends Optional<T> {
  T _obj;
  _Some(this._obj);
  @override _Some<T> map(Function f) => new _Some(f(_obj));
  @override Optional<T> fmap(Function f) => f(_obj);
  @override bool operator ==(other) => other is _Some && _obj == other._obj;
  @override T get() => _obj;
  @override T orElseGet(Function f) => _obj;
  @override bool isPresent() => true;
}

class _None<T> extends Optional<T> {
  _None();
  @override _None map(Function f) => this;
  @override _None fmap(Function f) => this;
  @override bool operator ==(other) => true;
  @override T get() => throw "why";
  @override T orElseGet(Function f) => f();
  @override bool isPresent() => false;
}
```

这个是随手写的实现，一定程度上参考了 Either 。

### Either

```dart
abstract class Either<L, R> {
  T pm<T>(Function lt, Function rt);
  dynamic get();
  static _Left<L, R> left<L, R>(L l) => new _Left(l);
  static _Right<L, R> right<L, R>(R r) => new _Right(r);
  static isLeft(Either e) => e is _Left;
  static isRight(Either e) => e is _Right;
}

class _Left<L, R> extends Either<L, R> {
  L _l;
  _Left(this._l);
  @override dynamic get() => _l;
  @override T pm<T>(Function lt, Function rt) => lt(_l);
  @override bool operator ==(Object rhs) => (rhs as Either<L, R>).pm((o) => _l == o, (rr) => false);
}

class _Right<L, R> extends Either<L, R> {
  L _r;
  _Right(this._r);
  @override dynamic get() => _r;
  @override T pm<T>(Function lt, Function rt) => rt(_r);
  @override bool operator ==(Object rhs) => (rhs as Either<L, R>).pm((ll) => false, (o) => _r == o);
}
```

其实是和 Java 版相同的写法，只是因为没有匿名内部类而采取了这种方式来妥协。

### Tuple

```dart
class Tuple<A, B> {
  A a;
  B b;
  Tuple(this.a, this.b);
  @override bool operator ==(other) => other is Tuple<A, B> && other.a == a && other.b == b;
}
```

这个没啥说的，很简单。

### Unit

```dart
class Unit {
  Unit();
  static Unit INSTANCE = new Unit();
}
```

和 Java 一模一样。

### Void

```dart
abstract class Void {
  A absurd<A>();
}
```

和 Java 一模一样。

## Rust

这语言管理内存的方式清新脱俗，我非常喜欢，特别适合写一些纯的东西。不过它有一点不好。就是 `FnBox` 依然没有
替代物，而且稳定版编译器没法用。

最后我被迫写出了正确的代码，但返回的函数却不能调用，所以只能 type check 。

### Void

```rust
pub enum Void { }

impl PartialEq for Void {
  fn eq(&self, _: &Void) -> bool { true }
}

pub fn absurd(_: Void) -> ! {
  panic!("You must be kidding! Where did you find that void instance?");
}					
```

除了这个（其实标准库也有，我在文档查到了，而且是能用的，但是我引用的时候编译器说找不到），其他全有。贼给力。

### Maybe

```rust
use std::option::Option;
```

### Tuple, Unit

语言级别的支持

### Either

```rust
use std::result::Result;
```

# 你学到了什么

说起来我曾经还把这个总结当成我博客的特色来着。有段时间没写这个了。

+ Java Dart Rust 模拟 `Tuple/Either/Maybe/Unit/Void`
+ Java 的 Lambda 语法设计比 Dart Kotlin 更成功
+ Dart 不支持\[匿名\]内部类
+ 其他的一些关于 Java 和 Dart 的个人看法
+ 如何在仅使用一个 field 的情况下搞出有两种可能的 field 类型的 `Either` 类型
+ Java 的 `Void` 为什么在这里不能用
+ 如何判断一个 Java 黑是不是傻逼
+ ~~加入莎莎的后宫的可能的新方式~~
