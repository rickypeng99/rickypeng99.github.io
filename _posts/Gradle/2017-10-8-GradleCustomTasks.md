---
layout: post
title: Gradle 常见的几个自定义 Task
category: Gradle
tags: Java,Gradle
keywords: Java,Gradle
description: Gradle customizing tasks
---

其实这只是对我来说常见的几个。 Gradle 是个很常用的工具其实，但是它默认的功能还是太贫瘠了，因为它提供了很方便的定制方法。

原本就只有编译打包之类的，打包也只有按照它默认那样来。

## 完整的打包

也就是把所有依赖一起打包。这个很简单，只需要把这个写在 `build.gradle` 下面：

```groovy
task fatJar(type: Jar) {
  baseName = project.name + '-all'
  from { configurations.compile.collect { it.isDirectory() ? it : zipTree(it) } }
  manifest { attributes 'Main-Class': 'org.lice.repl.Main' }
  with jar
}
```

然后你需要把 `org.lice.repl.Main` 换成你的 main 函数所在的那个类的全限定名。

在需要打包一个完整的 jar 的时候，运行

```groovy
$ gradle fatJar
```

就好了，可以在 `build/libs` 目录（也就是你原本 `gradle build` 的时候输出 jar 的位置）看到输出的 jar 。  
文件名是原本的 jar 文件名后面加个 `-all` 后缀。如果你想改的话改刚刚代码第二行就是了。

这样，在打包可执行 jar 的时候会很方便。

## 复制 License

```groovy
def webDir = "$buildDir/web"
task copyLicense {
  outputs.file new File("$webDir/LICENSE")
  doLast {
    copy {
      from "LICENSE"
      into webDir
    }
  }
}
```

其中 `"$buildDir/web"` 是要输出的目录， `buildDir` 就是那个 `build` 目录。

这 task 默认项目根目录有个叫 LICENSE 的文件。

## Kotlin2js 的打包

由于 Kotlin2js 是没有自带那种打包的，因此我们需要专门给他整个打包方案：

```groovy
def webDir = "$buildDir/web"

compileKotlin2Js {
  kotlinOptions.outputFile = "$webDir/posgen.js"
  kotlinOptions.moduleKind = "amd"
  kotlinOptions.sourceMap = true
}

task assembleWeb(type: Sync) {
  configurations.compile.each { File file ->
    from(zipTree(file.absolutePath), {
      includeEmptyDirs = false
      include { fileTreeElement ->
        def path = fileTreeElement.path
        path.endsWith(".js") && (path.startsWith("META-INF/resources/") ||
            !path.startsWith("META-INF/"))
      }
    })
  }
  from compileKotlin2Js.destinationDir
  into webDir
  dependsOn classes
}
```

然后执行

```groovy
$ gradle assembleWeb
```

就可以打包了。

同理，其中 `"$buildDir/web"` 也是要输出的目录。

## Kotlin2js 的超完整打包

我把上面几个 task 整合了一下，弄了个完整的打包 task ：

```groovy
task zipWeb(type: Zip) {
  from webDir
  into "web"
  archiveName = "out.zip"
  dependsOn build
  dependsOn classes
  dependsOn copyLicense
  dependsOn assembleWeb
}
```

## 一些通识性的东西

如果需要让 `gradle build` 的时候自动把上面的 task 也执行了，需要写

```groovy
build.dependsOn assembleWeb
```

，然后把 `assembleWeb` 换成你要自动执行的 task 的名字。然后就可以直接 `gradle build` 了。

## 延伸阅读

[极客学院](http://wiki.jikexueyuan.com/project/gradle-2-user-guide/)的 Gradle 教程翻译挺好的，推荐一下。

缺点是只适用于 Gradle 2 。读者也可以去[官网](https://docs.gradle.org/4.2.1/userguide/userguide.html)看教程。
