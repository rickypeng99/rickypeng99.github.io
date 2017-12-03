---
layout: post
title: Gradle 定制 artifact
category: Gradle
tags: Java,Gradle
keywords: Java,Gradle
description: Gradle customizing artifacts
---

很多人想打包个可执行的 jar ，但是写的项目拿 Gradle 打包出来就只有自己的源码，还得手动导包 \+ 配 META-INF 。

这次我们就来使用 Gradle 解决这个问题。

## 明确需求

首先我们明确一下我们的需求：

0. 需要定制 META-INF
0. 需要打包一部分依赖进入目标文件
0. 一部分依赖（即使是 compile 级别的依赖）也是不需要的

我解释一下最后一点。比如我们有个 groovy 项目，我们需要依赖一个巨大的 groovy 运行时。
这明显是 compile 级别的依赖，但别的 groovy 用户肯定就不希望自己依赖的项目带个 60 多 MB 的东西，
而且他们肯定自带 groovy 运行时。

在编译依赖的时候下载一个 60 多 MB 的东西肯定也是不现实的（ Kotlin 笑而不语），因此我们需要去掉一部分 compile 级别的依赖。

于是我们就需要在打包的时候指定三种类型的依赖：

+ test 级别
+ compile 级别
+ artifact 级别

别的不多说了我们直接看解决方案吧。

## 案例

我就拿我的 [Lice](https://github.com/lice-lang/lice) 的主仓库举例，为了突出效果，我给它强行加上了 `clojure script`
的依赖，实际上是不存在的。

它：

+ 依赖 Kotlin 标准库，需要打包到目标文件
+ 依赖 JUnit 和 Kotlin 标准测试库，作为测试库
+ 艺术性地加上了 `clj` 的依赖，不打包到目标文件
+ 需要打包可执行 jar ，主类是 `org.lice.repl.Main` 。

## 解决方案

### 依赖的配置

首先是依赖的问题：

```groovy
configurations {
  artifact
}

dependencies {
  artifact "org.jetbrains.kotlin:kotlin-stdlib-jre8:$kotlin_version"
  artifact group: 'org.jetbrains', name: 'annotations', version: '15.0'
  compile "org.clojure:clojurescript:1.8.51"

  configurations.compile.extendsFrom(configurations.artifact)

  testCompile group: 'junit', name: 'junit', version: '4.12'
  testCompile "org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version"
}
```

在上文中，我们首先定义了一种配置的类型：

```groovy
configurations {
  artifact
}
```

然后我们在 dependencies 里面添加了一行

```groovy
configurations.compile.extendsFrom(configurations.artifact)
```

就是把所有的 `要导出的` 库全部复制到 compile 级别（因为 artifact 级别的库一定是 compile 级别的）。

然后指定一些依赖：

```groovy
artifact "org.jetbrains.kotlin:kotlin-stdlib-jre8:$kotlin_version"
artifact group: 'org.jetbrains', name: 'annotations', version: '15.0'
compile "org.clojure:clojurescript:1.8.51"

testCompile group: 'junit', name: 'junit', version: '4.12'
testCompile "org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version"
```

### jar 的配置

最后我们需要在 `jar` 这个任务中指定一些配置。

```groovy
jar {
  manifest {
    attributes 'Main-Class': 'org.lice.repl.Main'
  }
  from {
    configurations
        .artifact
        .collect { it.isDirectory() ? it : zipTree(it) }
  }
}
```

首先，我们在 `manifest` 栏指定我们要加一个参数，就是主类，然后指定主类的全限定名。

最后我们在导出 jar 的时候把依赖加进去就好了。

测试一下，使用下面的指令（请把 `lice-3.1.1.jar` 换成你的 jar 的名字）：

```shell
./gradlew assemble
cd build
cd libs
java -jar lice-3.1.1.jar
```

成功看到了回显：

```lisp
D:\git-repos\lice-lang\build\libs>java -jar lice-3.1.1.jar
Lice language repl v3.1.1
see: https://github.com/lice-lang/lice

剑未佩妥，出门已是江湖。千帆过尽，归来仍是少年。
|> ((expr op (op 3 4)) (lambda a b (+ (* a a) (* b b))))
25 => java.lang.Integer
|> (def fun a (sin (+ a 1)))
defined: fun => org.lice.lang.DefineResult
|> ((expr op (op 3 4)) fun)
expected 1 arguments, found: 2
at line: 1
|> ((expr op (op 3)) fun)
-0.7568024953079282 => java.lang.Double
|>
```

享受你们自己吧。（谜之 Chinglish
