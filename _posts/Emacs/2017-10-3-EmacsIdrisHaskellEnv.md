---
layout: post
title: 搭建 Emacs 的 Haskell/Idris 环境教程
category: Emacs
tags: Emacs, Haskell, Idris
keywords: Emacs, Haskell, Idris
description: 又是搭建环境教程
---

最近看见 Haskell 群的萌新费尽心思也没成功搭建环境，而且很多都是用浏览器编程，很不清真。为了拯救苍生，顺便为考 SAT 攒人品，我决定写一篇搭建环境教程，来扩大 Emacs 势力。

由于 Idris 用户需要进行的操作基本上是 Haskell 用户的超集，因此未说明的地方就是都要进行的，针对 Idris 用户的额外步骤会说明。

编译 Idris 是一种浪漫，我的笔记本 5 分钟就编译好了，湛忠胜说编译了一下午。本文将讲述编译而不是下载二进制 Idris 的方法。

本文针对的操作系统是 Linux ，只要能用 apt 就可以了。

## 本文使用的工具及版本

+ Emacs 25
+ GHC 8.2.2
+ Cabal 1.24
+ Idris 1.1.1

## 本文使用的镜像源

+ [清华大学 tuna 镜像源](https://mirrors.tuna.tsinghua.edu.cn)

tuna 在本文发布的时候暂时挂掉了，因此在国庆期间搭建环境的同学们可以把下文中的 tuna 源智能替换为 ustc 源。
但是你就会遇到很多其它问题，所以我还是推荐等 tuna 活过来后用 tuna 。

+ [ustc 源](http://mirrors.ustc.edu.cn)

## apt 准备

先加源，然后安装，下面的指令直接复制进终端执行：

```shell
$ sudo add-apt-repository ppa:hvr/ghc
$ sudo add-apt-repository ppa:ubuntu-elisp/ppa
$ sudo apt-get update
$ sudo apt-get install emacs25
$ sudo apt-get install ghc-8.2.2
$ sudo apt-get install cabal-install-1.24
```

## 配置

打开你的 `~/.bashrc` ，加入下面的配置：

```shell
alias ec="emacsclient25 -nw"
alias en="emacs25 -nw"
alias ecw="emacsclient25"
export PATH=~/.cabal/bin:/opt/ghc/bin:/opt/cabal/bin:$PATH
```

以上代码节选自[我的 bashrc](https://github.com/ice1000/xjb-config/blob/master/.bashrc) 。

然后执行以下命令，以重新加载这些配置：

```shell
$ source ~/.bashrc
```

### 配置 Cabal

根据上面给出的 tuna 源的指示进行操作。
这对于 Haskell 来说不是必须的，但却是非常非常非常建议的。
Idris 用户请确保完成这一步。

### 编译 Idris

直接输指令就行：

```shell
$ cabal-1.24 update
$ cabal-1.24 install idris
```

## 搞懂啥是 emacsclient

其实是因为我使用了 linum-mode 这个插件，导致每次 Emacs 打开都特别慢 ~~，正好应了古人那句 EMACS == Emacs Makes A Computer Slower~~ 。
因此我将会采用 Emacs Daemon 来加速 Emacs 启动。
这个东西的原理就是先开个 Emacs 进程，在后台运行，把插件啥的都加载好，蓝后每次使用 Emacs 的时候启动一个客户端，连上这个后台进程就是了。
于是就可以超级快了。

首先，在开始启动第一个 Emacs 前，先启动守护进程：

```shell
$ emacs25 --daemon
```

蓝后在命令行使用 Emacs 打开一个文件，请输入

```shell
$ ec [你要打开的文件路径]
```

若要在 GUI 下使用 Emacs ，请使用

```
$ ecw [你要打开的文件路径]
```

推荐使用命令行。

这时如果你更新了你的配置，需要重启 Emacs ，那么你需要杀了 Emacs 并让他复活：

```
$ pkill emacs
$ emacs25 --daemon
```

这时候你的 Emacs 还是裸的，现在我们来配置它。

哦，差点忘了，为了防止一些悲剧发生，请在杀死 Emacs 前终止所有正在运行的 emacsclient 。

为了防止另一些悲剧的发生，请记下退出 Emacs 的快捷键： <kbd>Ctrl</kbd>+<kbd>X</kbd> <kbd>Ctrl</kbd>+<kbd>C</kbd>。按法：按住 <kbd>Ctrl</kbd> 不放，然后分别按 <kbd>X</kbd> 和 <kbd>C</kbd> 。

你打开你的 Emacs 之后应该看到它是这样的：

```
File Edit Options Buffers Tools Help
Welcome to GNU Emacs, one component of the GNU/Linux operating system.

Get help           C-h  (Hold down CTRL and press h)
Emacs manual       C-h r        Browse manuals     C-h i
Emacs tutorial     C-h t        Undo changes       C-x u
Buy manuals        C-h RET      Exit Emacs         C-x C-c
Activate menubar   M-`
(‘C-’ means use the CTRL key.  ‘M-’ means use the Meta (or Alt) key.
If you have no Meta key, you may instead type ESC followed by the character.)
Useful tasks:
Visit New File                  Open Home Directory
Customize Startup               Open *scratch* buffer

GNU Emacs 25.3.50.2 (x86_64-pc-linux-gnu, GTK+ Version 3.18.9)
 of 2017-09-16
Copyright (C) 2017 Free Software Foundation, Inc.

GNU Emacs comes with ABSOLUTELY NO WARRANTY; type C-h C-w for full details.
Emacs is Free Software--Free as in Freedom--so you can redistribute copies
of Emacs and modify it; type C-h C-c to see the conditions.
Type C-h C-o for information on getting the latest version.
-UUU:%%--F1  *GNU Emacs*    Top of 1.0k (1,0)      (Fundamental) ---------------
For information about GNU Emacs and the GNU system, type C-h C-a.
```

## 配置 Emacs

把下面的东西原封不动地抄进 `~/.emacs` 里面。

```elisp
(require 'package)
(setq package-archives
      '(("gnu"   . "http://mirrors.tuna.tsinghua.edu.cn/elpa/gnu/")
        ("melpa" . "http://mirrors.tuna.tsinghua.edu.cn/elpa/melpa/")))

(package-initialize)
(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(ac-auto-show-menu 0.1)
 '(ac-modes
   (quote
    (emacs-lisp-mode
     lisp-mode lisp-interaction-mode slime-repl-mode nim-mode c-mode cc-mode c++-mode objc-mode
     swift-mode go-mode java-mode malabar-mode clojure-mode clojurescript-mode scala-mode
     scheme-mode ocaml-mode tuareg-mode coq-mode haskell-mode agda-mode agda2-mode perl-mode
     cperl-mode python-mode ruby-mode lua-mode tcl-mode ecmascript-mode javascript-mode
     js-mode js-jsx-mode js2-mode js2-jsx-mode coffee-mode php-mode css-mode scss-mode
     less-css-mode elixir-mode makefile-mode sh-mode fortran-mode f90-mode ada-mode xml-mode
     sgml-mode web-mode ts-mode sclang-mode verilog-mode qml-mode apples-mode
     haskell-mode fundamental-mode
     idris-mode ; 这一行仅 Idris 用户添加
  )))
 '(blink-cursor-mode t)
 '(column-number-mode t)
 '(custom-enabled-themes nil)
 '(flyspell-abbrev-p t)
 '(flyspell-after-incorrect-word-string nil)
 '(font-use-system-font t)
 '(global-auto-complete-mode t)
 '(global-linum-mode t)
 '(idris-interpreter-path "~/.cabal/bin/idris") ; 这一行仅 Idris 用户添加
 '(show-paren-mode t)
 '(size-indication-mode t))
```

上面的配置有两行是只有 Idris 用户需要添加的，请注意阅读注释。

配置节选自[我的 .emacs](https://github.com/ice1000/xjb-config/blob/master/.emacs) ，原本还有一些其他内容，与 Haskell Idris 无关我就删了。

这时候重启 Emacs ，你会发现你的配置可能加载不起，因为你没装对应的插件。
我们首先在 Emacs 里按下 <kbd>Alt</kbd>+<kbd>X</kbd> ，然后这时你的光标出现在最下面。  
输入 `package-list-package` ，然后它应该是这样的：

```
-UUU:%%--F1  *GNU Emacs*    Top of 1.0k (1,0)      (Fundamental) ---------------
M-x package-list-packages
```

等一会(这时开始下载 tuna 上的 elpa/gnu 源的内容)，然后你会发现出现了插件列表。

大概是这样的：

```
  1  ace-window         0.9.0         available  Quickly switch windows.
  2  ack                1.5           available  interface to ack-like tools
  3  ada-mode           5.3.1         available  major-mode for editing Ada sou$
  4  ada-ref-man        2012.3        available  Ada Reference Manual 2012
  5  adaptive-wrap      0.5.1         available  Smart line-wrapping with wrap-$
  6  adjust-parens      3.0           available  Indent and dedent Lisp code, a$
  7  aggressive-indent  1.8.3         available  Minor mode to aggressively kee$
  8  ahungry-theme      1.5.0         available  Ahungry color theme for Emacs.$
  9  all                1.0           available  Edit all lines matching a give$
 10  ampc               0.2           available  Asynchronous Music Player Cont$
 11  arbitools          0.71          available  Package for chess tournaments $
 12  ascii-art-to-un... 1.11          available  a small artist adjunct
 13  async              1.9.2         available  Asynchronous processing in Ema$
 14  auctex             11.91.0       available  Integrated environment for *Te$
 15  aumix-mode         7             available  run the aumix program in a buf$
 16  auto-correct       1.1           available  Remembers and automatically fi$
 17  auto-overlays      0.10.9        available  Automatic regexp-delimited ove$
-UUU:%%--F1  *Packages*     Top of 25k  (1,0)      (Package Menu) --------------
```

使用快捷键 <kbd>Ctrl</kbd>+<kbd>S</kbd> 进入搜索，这时你的光标在最下面。
输入 `auto-complete` ，找到叫这个名字的插件。搜索结果之间用 <kbd>Ctrl</kbd>+<kbd>S</kbd> 切换。  
蓝后对它按下回车，看到半个屏幕变成了它的安装说明。  
我的是安装好了的，看起来和你们的会不大一样，不过基本上是这样的：

```
-UUU:%%--F1  *Packages*     65% of 25k  (199,9)    (Package Menu) --------------
 1auto-complete is a dependency package.
 2
 3     Status: Installed in ‘auto-complete-20170124.1845/’ (unsigned).
 4    Version: 20170124.1845
 5    Summary: Auto Completion for GNU Emacs
 6   Requires: popup-0.5.0, cl-lib-0.5
 7Required by: ac-c-headers-20151021.134
 8
 9This extension provides a way to complete with popup menu like:
10
-UU-:%%--F1  *Help*         Top of 618  (1,0)      (Help) ----------------------
Type C-x 1 to delete the help window, C-M-v to scroll help.
```

用 <kbd>Ctrl</kbd>+<kbd>X</kbd> <kbd>0</kbd> 切到这半个屏幕，然后把光标移动到 `[Install]` 上（上面就没有，因为我已经装好了），回车安装。

按理说安装是很快的，然后用 <kbd>Ctrl</kbd>+<kbd>0</kbd> 关掉这半个窗口。
你会发现原本的插件列表界面变成了一些编译信息。用 <kbd>Ctrl</kbd>+<kbd>X</kbd> <kbd>K</kbd> (输完这快捷键它会让你确认一下，这时回车就好)关掉它，回到原本的插件列表。

按照同样的步骤搜索并安装 `haskell-mode` 。 Idris 用户请安装 `idris-mode` 。

然后就什么都没有了！再用 Emacs 打开一个 `.hs` 结尾的文件，就可以看到漂亮的高亮了！

## 快乐生活每一天

你可以使用 <kbd>Tab</kbd> 键来调整缩进(而不是输入 Tab)， Haskell 插件会自动告诉你可以用哪些缩进，不会让你吃缩进的亏。

这个插件很牛逼。比如，你会发现，只有开启了 TypeFamilies 扩展后，

```haskell
type family Xxx
```

才会高亮出来。

### 对于 Idris

一样的，只是可以用 <kbd>Ctrl</kbd>+<kbd>C</kbd> <kbd>Ctrl</kbd>+<kbd>L</kbd> 自动进行 type check ，而且报错时还会把报错那一行高亮出来。

填 hole 请用 <kbd>Ctrl</kbd>+<kbd>C</kbd> <kbd>Ctrl</kbd>+<kbd>A</kbd> 。

## 健康生活一辈子

建议开启一个终端里两个 Tab ，一个开 Emacs ，一个开 ghci 。 Idris 同理。
