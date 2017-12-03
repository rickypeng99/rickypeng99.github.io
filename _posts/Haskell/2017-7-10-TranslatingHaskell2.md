---
layout: post
title: 将 Haskell 翻译为 Rust, C# （上'）标准库
category: Haskell
tags: Haskell
keywords: Haskell, C#, Rust
description: Translating Haskell into various languages
---

这次承接上篇，是关于 C\# 的。 Rust 的 algebraic isomorphism 也写好了，欢迎大家尝试。

# 进度

+ [algebraic isomorphism](https://www.codewars.com/kata/algebraic-isomorphism) 已支持 Rust, C\#.
+ [isomorphism](https://www.codewars.com/kata/isomorphism) 已支持 C\#

# 前情提要

+ [讲了 Rust Java Dart](../../../../2017/07/05/TranslatingHaskell)

前文曾经说过，

> 某些有**类 型 擦 除**的语言要尽可能避免类型擦除，除非推导不了了。

但是 C\# 没有类型擦除，所以你必须把类型全都写出来（ Java 的有时候就不用，因为被转换为 Object 类型了）

# 先 bb 两句

## 一个 Rust 的坑

Rust 有个问题，它目前还没有稳定支持的 `FnBox` 。也就是说，不能在返回 `capture 了 closure 的 closure`。
也就是说，上面给的这个例子， Rust 是做不到写出等价代码的（用 `FnBox` 可以，但是这个东西只有 Nightly 的编译器支持）。

对此，我的临时解决方案是：

0. 参数使用（反正就是传入的东西） `Box<Fn(_) -> _>` 类型，返回值使用（反正就是传出的东西） `Box<FnOnce(_) -> _>` 类型。这样就可以安全的返回了（这其实是个关于 GC 的问题，编译器担心在返回 closure 的时候 closure 里面 capture 的变量会被销毁，那么这样的调用就是不安全的，而当 closure capture 了 closure 后这个关系就更复杂了），后果是返回的这个 `Box<FnOnce(_) -> _>` 不能调用
0. test case 里面对返回的 closure 进行 type check 即可，不直接调用，后面会讲这个

# 库的实现（接上）

## C\#

C\# 不得不说是一门好语言，它的语言层面上的缺点我觉得是比 Java 少的（换言之，这是一门比 Java 更优秀的语言），
而且 Java 有的那种 Lambda 字面量在语法设计上的优点 C\# 也具备。这里给出一个完整的对比：

Java:
```java
return iso(ab -> a -> b -> ab.apply(a, b));
```

Kotlin:
```kotlin
return iso { ab -> { a -> { ab(a, it) } } }
```

Dart:
```dart
return iso((ab) => (a) => (b) => ab(a, b));
```

C\#:
```csharp
return Iso(ab => a => b => ab(a, b));
```

Rust:
```rust
// 很抱歉，写不出来。
```

而 C\# 有一个让我很难受的地方是，标准的大括号写法是这样的：

```csharp
public static string CSharpSucks()
{
  return "Yes you\'re right, I\'m sorry, I\'m so sorry";
}
```

这样就凭空多了很多很多行代码，非常不利于阅读。我只是能适应这样的写法。毕竟不好看归不好看，
写任何语言都应该听取官方的意见，这样才会写出最地道的代码。

你可能会说，C\# 有一个语法糖：

```csharp
public static string CSharpSucks() => "Yes you\'re right, I\'m sorry, I\'m so sorry";
```

很遗憾， CodeWars 不支持这个版本的 C\# 。

而且， C# 也没有匿名内部类。

### Either

```csharp
public abstract class Either<L, R>
{
  public abstract T Match<T>(Func<L, T> lt, Func<R, T> rt);
  public abstract override bool Equals(object obj);

  public static Either<L, R> Left(L l)
  {
    return new _Left<L, R>(l);
  }

  public static Either<L, R> Right(R r)
  {
    return new _Right<L, R>(r);
  }

  public class _Left<L, R> : Either<L, R>
  {
    private readonly L l;

    public _Left(L l)
    {
      this.l = l;
    }

    public override T Match<T>(Func<L, T> lt, Func<R, T> rt)
    {
      return lt(l);
    }

    public override bool Equals(object rhs)
    {
      return rhs is Either<L, R>
             && ((Either<L, R>) rhs).Match(arg => l.Equals(arg), rr => false);
    }
  }

  public class _Right<L, R> : Either<L, R>
  {
    private readonly R r;

    public _Right(R r)
    {
      this.r = r;
    }

    public override T Match<T>(Func<L, T> lt, Func<R, T> rt)
    {
      return rt(r);
    }

    public override bool Equals(object rhs)
    {
      return rhs is Either<L, R>
             && ((Either<L, R>) rhs).Match(ll => false, arg => r.Equals(arg));
    }
  }
}
```

### Maybe

```csharp
public abstract class Optional<T>
{
  public static Optional<T> From(T obj)
  {
    return new Some<T>(obj);
  }

  public static Optional<T> Empty()
  {
    return new None<T>();
  }

  public abstract Optional<R> Map<R>(Func<T, R> f);
  public abstract Optional<R> FlatMap<R>(Func<T, Optional<R>> f);
  public abstract T Get();
  public abstract T OrElseGet(Func<T> f);
  public abstract bool IsPresent();
  public abstract override bool Equals(object obj);

  public class Some<T> : Optional<T>
  {
    private readonly T _obj;

    public Some(T obj)
    {
      _obj = obj;
    }

    public override Optional<R> Map<R>(Func<T, R> f)
    {
      return new Some<R>(f(_obj));
    }

    public override Optional<R> FlatMap<R>(Func<T, Optional<R>> f)
    {
      return f(_obj);
    }

    public override bool Equals(object other)
    {
      return other is Some<T> && Equals(_obj, ((Some<T>) other)._obj);
    }

    public override T Get()
    {
      return _obj;
    }

    public override T OrElseGet(Func<T> f)
    {
      return _obj;
    }

    public override bool IsPresent()
    {
      return true;
    }
  }

  public class None<T> : Optional<T>
  {
    public override Optional<R> Map<R>(Func<T, R> f)
    {
      return new None<R>();
    }

    public override Optional<R> FlatMap<R>(Func<T, Optional<R>> f)
    {
      return new None<R>();
    }

    /// don't change this
    public override T Get()
    {
      throw new Exception("cannot get from null");
    }

    /// <summary>
    /// don't change this
    /// </summary>
    /// <param name="obj">other object</param>
    /// <returns>is equaled</returns>
    public override bool Equals(object obj)
    {
      return null != obj && obj.GetType().Name.Equals("None`1");
    }

    public override T OrElseGet(Func<T> f)
    {
      return f();
    }

    public override bool IsPresent()
    {
      return false;
    }
  }
}
```

### Tuple

标准库。

### Unit

```csharp
public class Unit
{
  private Unit()
  { }
  public static readonly Unit INSTANCE = new Unit();
}
```

### Void

```csharp
public abstract class Void
{
  public abstract A Absurd<A>();
}
```

标准库里面那个还是要不得（而且也不是 Bottom type）。

最后推荐一篇[我认为写的很好的关于 Haskell 的博客](https://ioover.net/learn/solution-log.1/)，是娘泉聚聚的，给我带来了很大的帮助。

## 你学到了什么

+ C\# 没有匿名内部类
+ Rust 暂时不支持 `Box<FnOnce(_) -> _>`
+ C\# 没有匿名内部类
+ C\# 没有类型擦除，所以你必须把类型全都写出来

# 为什么我要把 C\# 单独提出来说

因为~~太长了~~这个是最后完成的。
