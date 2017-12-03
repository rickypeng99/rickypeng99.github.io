---
layout: post
title: Kotlin 1.2 跨平台模块初体验
category: Kotlin
tags: Kotlin
keywords: Kotlin
description: Kotlin cross-platfrom
---

之前说不会再写 Kotlin 的东西了，现在为什么我又开始写了呢？并不是因为我傲娇或者口嫌体正直，是因为 Kotlin 有了重大更新了，那我对写 Kotlin 文章这一事的态度也应该重大更新一下啊是不是。

多 U 瓦 ke 蝶，我们来看看 Kotlin 1.2 Beta 的跨平台模块是怎么回事吧。

## 官方的说明

英语好的同学可以去
[Kotlin blog](https://blog.jetbrains.com/kotlin/2017/09/kotlin-1-2-beta-is-out/#more-5287)
瞄两眼，
或者看
[这个摆明了说将来出了偏差不负责任的文档](http://kotlinlang.org/docs/reference/multiplatform.html) 。

## 自己尝试

## 曾经提到过的东西的改动

还记得大明湖畔的 `header` 和 `impl` 保留字吗？这次起作用的正是这俩，
只不过在 Kotlin 1.2 中他们分别被换成了 `expect` 和 `actual` 。

由 `expect` 修饰的函数不能有实现，它表达一个函数签名，
然后库作者需要分别在 Kotlin2js 和 KotlinJVM 两个后端下实现该函数，
实现的时候需要使用 `actual` 修饰。

然后我们来看下如何创建一个跨平台的库项目。我们有好几种方法。

这里给出一个[参考项目](https://github.com/ice1000/learn/tree/master/Kotlin/multiplatform)。

### 使用 IntelliJ Renamer

#### 更新插件

这个方法的优点是无脑操作，缺点是你需要安装最新的预览版的插件。我安装的版本是 `1.2.0-beta-31-IJ2017.2-1` 。

可以从官网下载，也可以去 `Tools -> Kotlin -> Configure Kotlin Plugin Updates` 里面把 `Update channal` 改成 `Early Access Preview 1.2` ，
然后 `Check for updates now` ，然后点更新。

很遗憾，这种方法下你还是得在接下来的开发中使用 Gradle 。

#### 创建项目

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/17/0.png)

选这个，然后分别对你的总项目、 Kotlin2js 子项目、 KotlinJVM 子项目命名。我建议后两个用默认的。

创建好后你可以看到这样的文件目录结构。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/17/1.png)

然后在三个名叫 `kotlin` 的目录下各自创建一个叫 `Main.kt` 的文件。

### 使用命令行里的 Gradle

按照这个 yaml 创建你的整个工程：

```yml
<project-name>:
  <project-name>-js:
    src:
      main:
        kotlin:
          Main.kt
      build.gradle
  <project-name>-jvm:
    src:
      main:
        kotlin:
          Main.kt
      build.gradle
  src:
    main:
      kotlin:
        Main.kt
  build.gradle
  settings.gradle
```

把 `<project-name>` 换成你的工程的名字。
然后打开根目录下的 `build.gradle` ，输入：

```groovy
buildscript {
  ext.kotlin_version = '1.2.0-beta-31'

  repositories {
    maven { url 'http://dl.bintray.com/kotlin/kotlin-eap-1.2' }
    mavenCentral()
  }
  dependencies {
    classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
  }
}

apply plugin: 'kotlin-platform-common'

repositories {
  maven { url 'http://dl.bintray.com/kotlin/kotlin-eap-1.2' }
  mavenCentral()
}

dependencies {
  compile "org.jetbrains.kotlin:kotlin-stdlib-common:$kotlin_version"
  testCompile "org.jetbrains.kotlin:kotlin-test-common:$kotlin_version"
}
```

然后打开 `settings.gradle` ，输入：

```groovy
rootProject.name = '<project-name>'
include '<project-name>-jvm', '<project-name>-js'
```

把 `<project-name>` 换成你的工程的名字。

然后打开那个 js 结尾的目录下的 `build.gradle` ，输入：

```groovy
buildscript {
  ext.kotlin_version = '1.2.0-beta-31'

  repositories {
    maven { url 'http://dl.bintray.com/kotlin/kotlin-eap-1.2' }
    mavenCentral()
  }
  dependencies {
    classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
  }
}

apply plugin: 'kotlin-platform-js'

repositories {
  maven { url 'http://dl.bintray.com/kotlin/kotlin-eap-1.2' }
  mavenCentral()
}

dependencies {
  compile "org.jetbrains.kotlin:kotlin-stdlib-js:$kotlin_version"
  implement project(":")
}
```

然后这个是对应的 jvm 目录下的 `build.gradle` 。

```groovy
buildscript {
  ext.kotlin_version = '1.2.0-beta-31'

  repositories {
    maven { url 'http://dl.bintray.com/kotlin/kotlin-eap-1.2' }
    mavenCentral()
    maven {
      url 'http://dl.bintray.com/kotlin/kotlin-eap-1.2'
    }
  }
  dependencies {
    classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
  }
}

apply plugin: 'kotlin-platform-jvm'
apply plugin: 'kotlin'

repositories {
  maven { url 'http://dl.bintray.com/kotlin/kotlin-eap-1.2' }
  mavenCentral()
  maven {
    url 'http://dl.bintray.com/kotlin/kotlin-eap-1.2'
  }
}

dependencies {
  compile "org.jetbrains.kotlin:kotlin-stdlib-jre8:$kotlin_version"
  implement project(":")
  testCompile "junit:junit:4.12"
  testCompile "org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version"
  testCompile "org.jetbrains.kotlin:kotlin-test:$kotlin_version"
}
compileKotlin {
  kotlinOptions {
    jvmTarget = "1.8"
  }
}
compileTestKotlin {
  kotlinOptions {
    jvmTarget = "1.8"
  }
}
```

然后在命令行试构建一下（假定读者有 Gradle 命令行工具）：

```shell
$ gradle build
```

现在我们可以试着写点代码了。

## 写点代码

在最外层的 `Main.kt` 中写一个函数，表示输出到对应平台的控制台：

```kotlin
expect fun putStrLn(string: String)
```

然后在 js 工程下写一个实现，我们用 `console.log` ：

```kotlin
actual fun putStrLn(string: String) {
  console.log(string)
}
```

然后在 jvm 工程下写一个实现，我们用 `System.out::println` ：

```kotlin
actual fun putStrLn(string: String) {
  System.out.println(string)
}
```

然后用 IDE 编译，或者命令行使用 `gradle build` 。我们可以看到编译成功。

如果你使用 IDE ，在当前这个版本下， KotlinJVM 工程的那个文件会报错，而且当前好像没有解决方案。
不过呆胶布，我们可以直接在命令行编译，没有什么问题。

我还发现，在总工程中写非 `expect` 的函数会报错，不知道是有意而为之还是未完成特性。

那么就这样。

