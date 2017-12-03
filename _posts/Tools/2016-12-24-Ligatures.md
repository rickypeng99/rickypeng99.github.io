---
layout: post  
title: 连字及其在 IDE 中的使用
category: Tools
tags: Misc
keywords: ligature
description: interesting
---


## 连字是啥

就是一个标准，它有各种编辑器的插件，用来把一些特定的连在一起的字符组合起来增加可读性。

比如，一般的程序语言中把不等号表示成:

```c
!=
```

那么这个工具将会把这个符号变成:

```c
≠
```

以此类推。我觉得这个工具很好玩，而且不影响正常的代码编辑。目前我在日常写码过程中已经发现了这些符号可以形成连字：

```c
<> []
!= == <= >=
-> ->> --> <-- <<- <-
<<< >>> => ==> === <==
+> <+ <| |> </ />
/= ++ -- // \\ {- -}
|| && ?? !! ~~ .. ...
## ### #### *** ---
:D :O :Q :C
```

这是字体官方给的效果图：

![](https://github.com/tonsky/FiraCode/raw/master/showcases/all_ligatures.png)

要使用这个效果，请在你的 JetBrains IDE 中打开 Settings -> Editor -> Color and Fonts -> Font ， Primary Font 选 Fira Code ，然后把下面的 enable ligature 勾上。

顺便给出这个项目的[GitHub 地址](https://github.com/kudakurage/LigatureSymbols)以及 Fira Code 这个字体的[GitHub 地址](https://github.com/tonsky/FiraCode)。

一看 GitHub 才发现这神奇玩意竟然是 Clojure 写的。。。
