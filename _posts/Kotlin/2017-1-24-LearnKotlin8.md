---
layout: post
title: Kotlin 与 Java 交互技巧
category: Kotlin
tags: Essay
keywords: Kotlin
description: Kotlin to Java
---

作为一门 JVM 方言，与 Java 的互操作性当然是非常重要的 DAZE (又黑 Scala )， Kotlin 作为一门很萌很可爱的 JVM 方言，当然是需要良好的互操作性的 DAZE 。

那么， Kotlin 在很多与 Java 不一样的地方，是如何解决互操作的问题的呢？本篇博客就讲讲这个事情。

## 为什么要研究互操作

+ 因为有时会使用 Kotlin 编写一些 JVM 类库
+ 项目要引入 Kotlin ，总不可能一次性删了重来吧 = =

## null safety 

这是 Kotlin 的一大精髓，但是却是 Java 没有的特性。
于是 JetBrains 就选择了曲线救国的方式，那就是给那几个非 null 类型加上 annotation 。

比如如下 Kotlin 代码：

```kotlin
// 时刻记住，这里的 Object 和 Java 里的 Object 不一样，它多了一个 NotNull 的信息。 String 也是
fun toString(obj: Object): String {
	return obj.toString()
}
```

当然，你可以为了简洁而这么写：

```kotlin
fun toString(obj: Object) = obj.toString()
```

相当于如下 Java 代码：

```java
// 这个 NotNull 修饰的是返回值
@NotNull
// 这个 NotNull 修饰的是参数 obj
public String toString(@NotNull Object obj) {
	return obj.toString();
}
```

如果你这么写：

```kotlin
// 这样显示声明出 Nullable 信息往往比 NotNull 更容易让人记住它多出来的信息
fun toString(obj: Object?): String? {
	// 必须强制 null 检查，不然通不过编译
	// 什么？你说麻烦？这叫静态分析懂不懂
	return obj?.toString() ?: null
}
```

那么这相当于如下 Java 代码：

```java
@Nullable
public String toString(@Nullable Object obj) {
	return obj != null ? obj.toString() : null;
}
```

请注意区别喔。

## singleton object and companion object

我们都知道 Kotlin 里面没有 `static` 方法的概念，它通过 `object` 声明单例对象的方法来让你使用 `static` 的代码。
比如：

```kotlin
object Boy {
	fun next() {
		println("你不清真")
	}
}
```

那么这个 `Boy.next()` 就是一个静态的方法。 Kotlin 通过**将他编译为一个单例对象**的方式来实现静态。
这段代码放在 Java 里就需要这样调用：

```java
public static void main(String[] args) {
	Boy.INSTANCE.next();
}
```

有时你会觉得这个 `INSTANCE` 显得很啰嗦（不过对于纯 Kotlin 项目来说则不存在这些破问题）。于是你可以这样写：

```kotlin
object Boy {
	@JvmStatic // 这个 annotation 是修饰在方法上的
	fun next() {
		println("你不清真")
	}
}
```

这样， Kotlin 编译器就会再生成一个静态的方法。这对于 Kotlin 代码没有影响，对于 Java 代码则减少了一个 `INSTANCE` 的调用。
此方法同样适用于去掉 `companion object` 的 `COMPANION` 对象：

```kotlin
class SomeClass {
	companion object {
		@JvmStatic
		fun someMethod() = Unit
	}
}
```

对应的 Java 端：

```java
class JavaClass {
	public static void main(String[] args) {
		// 加上 JvmStatic 之前
		SomeClass.COMPANION.someMethod()
		// 之后
		SomeClass.someMethod()
	}
}
```

当然，如果你是一个追求艺术感的人，你甚至可以为你的 `companion object` 命名：

```kotlin
class Van {
	companion object DeepDarkFantasy {
		@JvmStatic
		fun go() = Unit
	}
}
```

调用处就得这么写：

```java
class Billy {
	public static void main(String[] args) {
		Van.DeepDarkFantasy.go()
	}
}
```

## getters and setters for fields

我们都知道 Kotlin 有个神奇的特性。就是所有的 '单参数， `set` 开头，无返回值'和'无参数， `get`/`is` 开头，有返回值'的方法会被视为一个成员变量的 setter/getter 。
而一个 Kotlin 的类成员变量会被自动生成 getter 和 setter 。有时，这个特性会令人感到比较蛋疼。比如说：

```kotlin
class Color {
	companion object Colors {
		val 基佬紫 = Color(0x8A2BE2)
	}
}
```

这时你发现，调用变成了：

```java
class Caller {
	public static void main(String[] args) {
		Color.COMPANION.get 基佬紫()
	}
}
```

你想不让它生成 getter ，就需要加个注解：

```kotlin
class Color {
	companion object Colors {
		@JvmField
		val 基佬紫 = Color(0x781895)
	}
}
```

这样就不会产生 getter 了。这个 `@JvmField` 同时去掉了 getter 和 `COMPANION` 。

还有一大堆注解下次再说。

## 你学到了什么

+ `@JvmField`
+ `@JvmStatic`
+ `companion object` 命名
+ null safety 的 Java 交互







